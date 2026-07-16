/**
 * BiteBook backend — Google Apps Script web app.
 *
 * Stores recipes in a Google Sheet and photos in a Drive folder, both owned
 * by the account that deploys this script. Deployed as a web app with
 * "Execute as: Me" + "Who has access: Anyone", it acts as a free JSON API,
 * so the family keeps using BiteBook with no login (same model as before).
 *
 * Setup (one time):
 *   1. script.google.com → New project → paste this file.
 *   2. Change API_SECRET below to a long random string.
 *   3. Run the `setup` function once (grants permissions, creates the
 *      spreadsheet + Drive folders).
 *   4. Deploy → New deployment → Web app → Execute as: Me,
 *      Who has access: Anyone → copy the /exec URL.
 *
 * API (all responses are JSON):
 *   GET  ?action=list                       → all recipes
 *   GET  ?action=get&id=<uuid>              → one recipe or null
 *   POST body: { secret, action, ... }      → writes:
 *     { action: "create", input, imageBase64?, imageContentType? }
 *     { action: "update", id, input, imageBase64?, imageContentType? }
 *     { action: "patch",  id, patch }
 *     { action: "delete", ids: [...] }
 *     { action: "import", recipe, imageBase64?, imageContentType? }  // migration, upserts by id
 *
 * POST bodies must be sent with Content-Type: text/plain to avoid CORS
 * preflight (Apps Script web apps cannot answer OPTIONS requests).
 */

// Must match the value the web/mobile apps send. Not real security — it only
// stops strangers who stumble on the URL from writing. Reads are open.
var API_SECRET = "CHANGE-ME-to-a-long-random-string";

var FOLDER_NAME = "BiteBook";
var IMAGES_FOLDER_NAME = "Images";
var SPREADSHEET_NAME = "BiteBook Data";
var SHEET_NAME = "Recipes";

var HEADERS = [
  "id", "title", "description", "category", "tags", "image_url",
  "ingredients", "instructions", "notes", "calories", "protein", "carbs",
  "fat", "is_favorite", "times_cooked", "last_cooked_at", "created_at",
  "updated_at",
];

// ---------------------------------------------------------------------------
// Entry points
// ---------------------------------------------------------------------------

function setup() {
  getSheet_();
  getImagesFolder_();
  Logger.log("Setup complete. Spreadsheet + Drive folders are ready.");
}

function doGet(e) {
  var action = (e.parameter.action || "list").toLowerCase();
  try {
    if (action === "list") return json_(listRecipes_());
    if (action === "get") return json_(getRecipe_(e.parameter.id));
    return json_({ error: "Unknown action: " + action });
  } catch (err) {
    return json_({ error: String(err) });
  }
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var body = JSON.parse(e.postData.contents);
    if (body.secret !== API_SECRET) return json_({ error: "Forbidden" });

    switch (body.action) {
      case "create":
        return json_(createRecipe_(body.input, body.imageBase64, body.imageContentType));
      case "update":
        return json_(updateRecipe_(body.id, body.input, body.imageBase64, body.imageContentType));
      case "patch":
        return json_(patchRecipe_(body.id, body.patch));
      case "delete":
        return json_(deleteRecipes_(body.ids || []));
      case "import":
        return json_(importRecipe_(body.recipe, body.imageBase64, body.imageContentType));
      default:
        return json_({ error: "Unknown action: " + body.action });
    }
  } catch (err) {
    return json_({ error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// ---------------------------------------------------------------------------
// CRUD
// ---------------------------------------------------------------------------

function listRecipes_() {
  var sheet = getSheet_();
  var last = sheet.getLastRow();
  if (last < 2) return [];
  var values = sheet.getRange(2, 1, last - 1, HEADERS.length).getValues();
  return values.map(rowToRecipe_).sort(function (a, b) {
    return a.created_at < b.created_at ? 1 : -1;
  });
}

function getRecipe_(id) {
  var found = findRow_(id);
  return found ? rowToRecipe_(found.values) : null;
}

function createRecipe_(input, imageBase64, contentType) {
  var now = new Date().toISOString();
  var recipe = {
    id: Utilities.getUuid(),
    created_at: now,
    updated_at: now,
    times_cooked: input.times_cooked || 0,
    last_cooked_at: input.last_cooked_at || null,
  };
  applyInput_(recipe, input);
  recipe.image_url = imageBase64
    ? uploadImage_(recipe.id, imageBase64, contentType)
    : input.image_url || null;

  getSheet_().appendRow(recipeToRow_(recipe));
  return recipe;
}

function updateRecipe_(id, input, imageBase64, contentType) {
  var found = findRow_(id);
  if (!found) throw new Error("Recipe not found: " + id);
  var recipe = rowToRecipe_(found.values);

  applyInput_(recipe, input);
  if (imageBase64) {
    recipe.image_url = uploadImage_(id, imageBase64, contentType);
  } else if ("image_url" in input) {
    recipe.image_url = input.image_url;
  }
  recipe.updated_at = new Date().toISOString();

  writeRow_(found.rowIndex, recipe);
  return recipe;
}

function patchRecipe_(id, patch) {
  var found = findRow_(id);
  if (!found) throw new Error("Recipe not found: " + id);
  var recipe = rowToRecipe_(found.values);

  if ("is_favorite" in patch) recipe.is_favorite = Boolean(patch.is_favorite);
  if ("times_cooked" in patch) recipe.times_cooked = Number(patch.times_cooked) || 0;
  if ("last_cooked_at" in patch) recipe.last_cooked_at = patch.last_cooked_at;
  recipe.updated_at = new Date().toISOString();

  writeRow_(found.rowIndex, recipe);
  return recipe;
}

function deleteRecipes_(ids) {
  var sheet = getSheet_();
  var last = sheet.getLastRow();
  if (last < 2) return { deleted: 0 };
  var idCol = sheet.getRange(2, 1, last - 1, 1).getValues();
  var deleted = 0;
  // Bottom-up so row indices stay valid while deleting.
  for (var i = idCol.length - 1; i >= 0; i--) {
    if (ids.indexOf(idCol[i][0]) !== -1) {
      sheet.deleteRow(i + 2);
      deleted++;
    }
  }
  return { deleted: deleted };
}

/** Migration upsert: keeps the original id and timestamps. */
function importRecipe_(recipe, imageBase64, contentType) {
  if (imageBase64) {
    recipe.image_url = uploadImage_(recipe.id, imageBase64, contentType);
  }
  var found = findRow_(recipe.id);
  if (found) {
    writeRow_(found.rowIndex, recipe);
  } else {
    getSheet_().appendRow(recipeToRow_(recipe));
  }
  return recipe;
}

// ---------------------------------------------------------------------------
// Images
// ---------------------------------------------------------------------------

/** Uploads a photo to Drive (link-shared) and returns a direct-view URL. */
function uploadImage_(recipeId, base64, contentType) {
  var bytes = Utilities.base64Decode(base64);
  var ext = contentType === "image/webp" ? ".webp"
    : contentType === "image/png" ? ".png" : ".jpg";
  var blob = Utilities.newBlob(bytes, contentType || "image/jpeg", recipeId + ext);
  var file = getImagesFolder_().createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  // lh3 serves link-shared Drive images with CDN caching; works in <img> tags.
  return "https://lh3.googleusercontent.com/d/" + file.getId();
}

// ---------------------------------------------------------------------------
// Sheet plumbing
// ---------------------------------------------------------------------------

function getFolder_() {
  var it = DriveApp.getFoldersByName(FOLDER_NAME);
  return it.hasNext() ? it.next() : DriveApp.createFolder(FOLDER_NAME);
}

function getImagesFolder_() {
  var parent = getFolder_();
  var it = parent.getFoldersByName(IMAGES_FOLDER_NAME);
  return it.hasNext() ? it.next() : parent.createFolder(IMAGES_FOLDER_NAME);
}

function getSheet_() {
  var props = PropertiesService.getScriptProperties();
  var ssId = props.getProperty("SPREADSHEET_ID");
  var ss;
  if (ssId) {
    ss = SpreadsheetApp.openById(ssId);
  } else {
    ss = SpreadsheetApp.create(SPREADSHEET_NAME);
    DriveApp.getFileById(ss.getId()).moveTo(getFolder_());
    props.setProperty("SPREADSHEET_ID", ss.getId());
  }
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    // Plain-text format everywhere so ISO dates and JSON never get coerced.
    sheet.getRange(1, 1, sheet.getMaxRows(), HEADERS.length).setNumberFormat("@");
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function findRow_(id) {
  var sheet = getSheet_();
  var last = sheet.getLastRow();
  if (last < 2) return null;
  var values = sheet.getRange(2, 1, last - 1, HEADERS.length).getValues();
  for (var i = 0; i < values.length; i++) {
    if (values[i][0] === id) return { rowIndex: i + 2, values: values[i] };
  }
  return null;
}

function writeRow_(rowIndex, recipe) {
  getSheet_()
    .getRange(rowIndex, 1, 1, HEADERS.length)
    .setValues([recipeToRow_(recipe)]);
}

function applyInput_(recipe, input) {
  recipe.title = input.title || "";
  recipe.description = input.description || "";
  recipe.category = input.category || "Other";
  recipe.tags = input.tags || [];
  recipe.ingredients = input.ingredients || [];
  recipe.instructions = input.instructions || [];
  recipe.notes = input.notes || "";
  recipe.calories = numOrNull_(input.calories);
  recipe.protein = numOrNull_(input.protein);
  recipe.carbs = numOrNull_(input.carbs);
  recipe.fat = numOrNull_(input.fat);
  recipe.is_favorite = Boolean(input.is_favorite);
}

/** Everything is stored as plain text; parse types back out here. */
function rowToRecipe_(row) {
  return {
    id: row[0],
    title: row[1],
    description: row[2],
    category: row[3],
    tags: parseJson_(row[4], []),
    image_url: row[5] || null,
    ingredients: parseJson_(row[6], []),
    instructions: parseJson_(row[7], []),
    notes: row[8],
    calories: numOrNull_(row[9]),
    protein: numOrNull_(row[10]),
    carbs: numOrNull_(row[11]),
    fat: numOrNull_(row[12]),
    is_favorite: String(row[13]).toLowerCase() === "true",
    times_cooked: Number(row[14]) || 0,
    last_cooked_at: row[15] || null,
    created_at: row[16],
    updated_at: row[17],
  };
}

function recipeToRow_(r) {
  return [
    r.id, r.title, r.description, r.category, JSON.stringify(r.tags || []),
    r.image_url || "", JSON.stringify(r.ingredients || []),
    JSON.stringify(r.instructions || []), r.notes || "",
    r.calories == null ? "" : String(r.calories),
    r.protein == null ? "" : String(r.protein),
    r.carbs == null ? "" : String(r.carbs),
    r.fat == null ? "" : String(r.fat),
    r.is_favorite ? "true" : "false",
    String(r.times_cooked || 0),
    r.last_cooked_at || "", r.created_at, r.updated_at,
  ];
}

function parseJson_(text, fallback) {
  if (!text) return fallback;
  try {
    return JSON.parse(text);
  } catch (e) {
    return fallback;
  }
}

function numOrNull_(v) {
  if (v === "" || v == null) return null;
  var n = Number(v);
  return isNaN(n) ? null : n;
}

function json_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

/**
 * GOOGLE APPS SCRIPT: LEAD DATA MIGRATION + NEXT.JS CRUD API
 *
 * Endpoints
 *   GET  ?action=list                    -> all leads from the 6 status tabs
 *   GET  ?action=read&phone=XXXXXXXXXX   -> single lead
 *   POST { action: "create", record }
 *   POST { action: "update", phone, updatedRecord }   (moves tab if status changes)
 *   POST { action: "delete", phone }
 *
 * Sheet columns (row 1 of every tab):
 *   Date | Phone num | Phone | Name | Age | Assigned | status | next followup | Comments/Notes
 *   "Phone" is the unique key used by read / update / delete.
 */

// Mapping Status options (normalized) to Google Sheet tab names
var STATUS_TO_SHEET_MAP = {
  "new lead": "new leads",
  "interested": "interested",
  "call later": "call later",
  "deciding": "deciding",
  "not responded": "not responded",
  "not interested": "not interested"
};

// Exact values written to the "status" column.
// Must match the sheet's dropdown (data validation) options character-for-character.
var CANONICAL_STATUS = {
  "new lead": "new lead",
  "interested": "Interested",
  "call later": "call later",
  "deciding": "deciding",
  "not responded": "not responded",
  "not interested": "Not interested"
};

var VALID_SHEET_NAMES = [
  "new leads",
  "interested",
  "call later",
  "deciding",
  "not responded",
  "not interested"
];

var PHONE_HEADER = "phone";
var STATUS_HEADER = "status";
var DATE_HEADER = "date";

// ===========================================================================
// HELPERS
// ===========================================================================

function normalize(str) {
  return str === null || str === undefined ? "" : String(str).trim().toLowerCase();
}

function phoneKey(value) {
  return value === null || value === undefined ? "" : String(value).trim();
}

function getSheetNameFromStatus(status) {
  return STATUS_TO_SHEET_MAP[normalize(status)] || null;
}

function getCanonicalStatus(status) {
  return CANONICAL_STATUS[normalize(status)] || null;
}

function errorResult(message) {
  return { status: "error", message: message };
}

function getHeaders(sheet) {
  var lastCol = sheet.getLastColumn();
  if (lastCol < 1) return [];
  return sheet.getRange(1, 1, 1, lastCol).getValues()[0];
}

function findHeaderIndex(headers, name) {
  var target = normalize(name);
  for (var i = 0; i < headers.length; i++) {
    if (normalize(headers[i]) === target) return i;
  }
  return -1;
}

// Case/space-insensitive key lookup ("Status", "status ", "STATUS" all match "status")
function getField(record, header) {
  if (!record) return undefined;
  var target = normalize(header);
  for (var key in record) {
    if (Object.prototype.hasOwnProperty.call(record, key) && normalize(key) === target) {
      return record[key];
    }
  }
  return undefined;
}

// Raw values keyed by header (keeps Date objects; used internally for moves)
function rawRecord(headers, values) {
  var record = {};
  headers.forEach(function (h, i) {
    var key = String(h).trim();
    if (key) record[key] = values[i];
  });
  return record;
}

// JSON-safe record for API responses (dates -> yyyy-MM-dd, phones -> string)
function outputRecord(headers, values, tz) {
  var record = {};
  headers.forEach(function (h, i) {
    var key = String(h).trim();
    if (!key) return;
    var v = values[i];
    if (v instanceof Date) {
      v = Utilities.formatDate(v, tz, "yyyy-MM-dd");
    } else if (normalize(key).indexOf("phone") === 0 && v !== "" && v !== null) {
      v = String(v);
    }
    record[key] = v;
  });
  return record;
}

// Builds a row for `headers`, taking each value from the first source that has it.
function buildRow(headers, sources) {
  return headers.map(function (h) {
    if (!String(h).trim()) return "";
    for (var s = 0; s < sources.length; s++) {
      var v = getField(sources[s], h);
      if (v !== undefined && v !== null) return v;
    }
    return "";
  });
}

// Appends a row; the Phone cell is formatted as plain text first so values like
// "+91 98765 43210" or leading zeros are stored exactly as sent.
function insertRow(sheet, headers, row) {
  var phoneIdx = findHeaderIndex(headers, PHONE_HEADER);
  var rowNumber = sheet.getLastRow() + 1;
  if (phoneIdx > -1) {
    row[phoneIdx] = phoneKey(row[phoneIdx]);
    sheet.getRange(rowNumber, phoneIdx + 1).setNumberFormat("@");
  }
  sheet.getRange(rowNumber, 1, 1, row.length).setValues([row]);
  return rowNumber;
}

// Finds a lead by Phone across all status tabs.
function findLead(phone) {
  var key = phoneKey(phone);
  if (!key) return null;

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  for (var t = 0; t < VALID_SHEET_NAMES.length; t++) {
    var sheetName = VALID_SHEET_NAMES[t];
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet || sheet.getLastRow() < 2) continue;

    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    var phoneIdx = findHeaderIndex(headers, PHONE_HEADER);
    if (phoneIdx === -1) continue;

    for (var i = 1; i < data.length; i++) {
      if (phoneKey(data[i][phoneIdx]) === key) {
        return { sheet: sheet, table: sheetName, headers: headers, rowNumber: i + 1, values: data[i] };
      }
    }
  }
  return null;
}

// ===========================================================================
// 1. DATA MIGRATION ON SHEET EDIT (manual edits inside Google Sheets)
// ===========================================================================
function onEdit(e) {
  if (!e || !e.range) return;
  var range = e.range;
  var sheet = range.getSheet();
  var sourceSheetName = normalize(sheet.getName());

  if (VALID_SHEET_NAMES.indexOf(sourceSheetName) === -1) return;

  var headers = getHeaders(sheet);
  var statusIdx = findHeaderIndex(headers, STATUS_HEADER);
  var phoneIdx = findHeaderIndex(headers, PHONE_HEADER);
  if (statusIdx === -1 || phoneIdx === -1) return;

  // Only react when the status column is part of the edited range
  var firstCol = range.getColumn();
  var lastCol = firstCol + range.getNumColumns() - 1;
  if (statusIdx + 1 < firstCol || statusIdx + 1 > lastCol) return;

  var firstRow = Math.max(range.getRow(), 2);
  var lastRow = range.getRow() + range.getNumRows() - 1;

  // Bottom-up so deleting a row doesn't shift rows still to be processed (multi-row paste)
  for (var r = lastRow; r >= firstRow; r--) {
    var values = sheet.getRange(r, 1, 1, headers.length).getValues()[0];
    moveRowOnEdit(e.source, sheet, sourceSheetName, headers, r, values, statusIdx, phoneIdx);
  }
}

function moveRowOnEdit(ss, sheet, sourceSheetName, headers, rowNumber, values, statusIdx, phoneIdx) {
  var targetSheetName = getSheetNameFromStatus(values[statusIdx]);
  if (!targetSheetName || targetSheetName === sourceSheetName) return;

  var key = phoneKey(values[phoneIdx]);
  if (!key) return;

  var targetSheet = ss.getSheetByName(targetSheetName);
  if (!targetSheet) return;

  // Map by header name, so tabs with a different column order still line up
  var targetHeaders = getHeaders(targetSheet);
  var targetPhoneIdx = findHeaderIndex(targetHeaders, PHONE_HEADER);
  if (targetPhoneIdx === -1) return;

  var row = buildRow(targetHeaders, [rawRecord(headers, values)]);

  // Upsert into target sheet
  var existingRow = -1;
  if (targetSheet.getLastRow() >= 2) {
    var targetPhones = targetSheet
      .getRange(2, targetPhoneIdx + 1, targetSheet.getLastRow() - 1, 1)
      .getValues();
    for (var i = 0; i < targetPhones.length; i++) {
      if (phoneKey(targetPhones[i][0]) === key) {
        existingRow = i + 2;
        break;
      }
    }
  }

  if (existingRow !== -1) {
    targetSheet.getRange(existingRow, 1, 1, row.length).setValues([row]);
  } else {
    insertRow(targetSheet, targetHeaders, row);
  }

  // Delete from current sheet only after the target write succeeded
  sheet.deleteRow(rowNumber);
}

// ===========================================================================
// 2. NEXT.JS WEB APP API (LIST, READ, CREATE, UPDATE, DELETE)
// ===========================================================================

function doGet(e) {
  try {
    var params = (e && e.parameter) || {};
    var action = params.action;

    if (action === "list") return responseJSON(listLeads());
    if (action === "read" && params.phone) return responseJSON(getLeadByPhone(params.phone));

    return responseJSON(errorResult("Use action=list, or action=read with a phone parameter."));
  } catch (err) {
    return responseJSON(errorResult(err.toString()));
  }
}

function doPost(e) {
  // Prevents two simultaneous writes from shifting each other's row numbers
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);

    var body = JSON.parse(e.postData.contents);
    var action = body.action;

    if (action === "create") return responseJSON(createLead(body.record));
    if (action === "update") return responseJSON(updateLead(body.phone, body.updatedRecord));
    if (action === "delete") return responseJSON(deleteLead(body.phone));

    return responseJSON(errorResult("Invalid action."));
  } catch (err) {
    return responseJSON(errorResult(err.toString()));
  } finally {
    lock.releaseLock();
  }
}

function responseJSON(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// LIST
function listLeads() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var tz = ss.getSpreadsheetTimeZone();
  var leads = [];

  VALID_SHEET_NAMES.forEach(function (sheetName) {
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet || sheet.getLastRow() < 2) return;

    var data = sheet.getDataRange().getValues();
    var headers = data[0];

    for (var i = 1; i < data.length; i++) {
      var isBlank = data[i].every(function (c) { return c === "" || c === null; });
      if (isBlank) continue;
      var record = outputRecord(headers, data[i], tz);
      record._tab = sheetName;
      leads.push(record);
    }
  });

  return { status: "success", count: leads.length, data: leads };
}

// READ
function getLeadByPhone(phone) {
  var found = findLead(phone);
  if (!found) return errorResult("Lead not found.");

  var tz = SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone();
  return { status: "success", table: found.table, data: outputRecord(found.headers, found.values, tz) };
}

// CREATE
function createLead(record) {
  record = record || {};

  var phone = phoneKey(getField(record, PHONE_HEADER));
  if (!phone) return errorResult("Phone number is required.");

  var statusInput = getField(record, STATUS_HEADER) || "new lead";
  var status = getCanonicalStatus(statusInput);
  if (!status) return errorResult("Invalid status '" + statusInput + "'.");
  var targetTable = getSheetNameFromStatus(status);

  var existing = findLead(phone);
  if (existing) return errorResult("Lead already exists in tab '" + existing.table + "'.");

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(targetTable);
  if (!sheet) return errorResult("Target sheet '" + targetTable + "' not found.");

  var overrides = { status: status, phone: phone };
  if (!getField(record, DATE_HEADER)) {
    overrides.date = Utilities.formatDate(new Date(), ss.getSpreadsheetTimeZone(), "yyyy-MM-dd");
  }

  var headers = getHeaders(sheet);
  insertRow(sheet, headers, buildRow(headers, [overrides, record]));

  return { status: "success", table: targetTable, message: "Lead created in '" + targetTable + "'." };
}

// UPDATE
function updateLead(phone, updatedFields) {
  updatedFields = updatedFields || {};

  var existing = findLead(phone);
  if (!existing) return errorResult("Lead not found.");

  var currentTable = existing.table;
  var targetTable = currentTable;
  var overrides = {};

  // Validate status (an unknown status must NOT silently move the lead)
  var statusInput = getField(updatedFields, STATUS_HEADER);
  if (statusInput !== undefined && String(statusInput).trim() !== "") {
    var status = getCanonicalStatus(statusInput);
    if (!status) return errorResult("Invalid status '" + statusInput + "'.");
    overrides.status = status;
    targetTable = getSheetNameFromStatus(status);
  }

  // Phone change: must stay non-empty and unique
  var finalPhone = phoneKey(phone);
  var phoneInput = getField(updatedFields, PHONE_HEADER);
  if (phoneInput !== undefined) {
    var newPhone = phoneKey(phoneInput);
    if (!newPhone) return errorResult("Phone number cannot be empty.");
    if (newPhone !== finalPhone && findLead(newPhone)) {
      return errorResult("Another lead already uses phone " + newPhone + ".");
    }
    overrides.phone = newPhone;
    finalPhone = newPhone;
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();

  if (targetTable === currentTable) {
    // Same tab: only touch the cells that were sent (keeps any formulas in other cells)
    var sheet = existing.sheet;
    existing.headers.forEach(function (h, colIdx) {
      if (!String(h).trim()) return;
      var v = getField(overrides, h);
      if (v === undefined) v = getField(updatedFields, h);
      if (v === undefined) return;

      var cell = sheet.getRange(existing.rowNumber, colIdx + 1);
      if (normalize(h) === PHONE_HEADER) {
        cell.setNumberFormat("@");
        v = phoneKey(v);
      }
      cell.setValue(v === null ? "" : v);
    });
  } else {
    // Status changed: write to the new tab FIRST, then delete from the old one,
    // so a failure can never lose the lead.
    var targetSheet = ss.getSheetByName(targetTable);
    if (!targetSheet) return errorResult("Target sheet '" + targetTable + "' not found.");

    var targetHeaders = getHeaders(targetSheet);
    var current = rawRecord(existing.headers, existing.values);
    insertRow(targetSheet, targetHeaders, buildRow(targetHeaders, [overrides, updatedFields, current]));

    existing.sheet.deleteRow(existing.rowNumber);
  }

  var updated = getLeadByPhone(finalPhone);
  if (updated.status !== "success") return errorResult("Update written but lead could not be re-read.");

  return {
    status: "success",
    table: updated.table,
    data: updated.data,
    message: targetTable === currentTable
      ? "Updated lead in '" + currentTable + "'."
      : "Moved lead from '" + currentTable + "' to '" + targetTable + "'."
  };
}

// DELETE
function deleteLead(phone) {
  var existing = findLead(phone);
  if (!existing) return errorResult("Lead not found.");

  existing.sheet.deleteRow(existing.rowNumber);
  return { status: "success", message: "Deleted lead (" + phoneKey(phone) + ") from '" + existing.table + "'." };
}

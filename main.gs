function handle() {
  var startTime = new Date().getTime();

  // シートから収集対象かつまだ処理していないinstagramIdを取得する
  let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet2");
  let [instagramIds, insertStartIndex] = getInstagramIdsAndStartIndex(sheet);

  if (instagramIds.length === 0 || insertStartIndex === 0) {
    Logger.log('Inputが正しくないか、処理するデータがありません。');
    return ;
  }

  // instagramの情報を取得し、[instagramID, 取得情報, 現在の日時] 形式で配列を作る
  let mappingSheet = Array();
  instagramIds.forEach(function(item) {
    mappingSheet.push([item, getInstagramAccountData(item), getCurrentDateAsString()]);
  }, this);

  // 今回の対象位置から配列の長さ分だけ範囲を確保し、配列の値をSheetに反映する
  let range = sheet.getRange(insertStartIndex, 1, mappingSheet.length, mappingSheet[0].length);
  range.setValues(mappingSheet);

  let endTime = new Date().getTime();
  let elapsedTime = endTime - startTime;
  Logger.log("処理時間: " + elapsedTime + "ミリ秒");
}

// まだ処理されていないIdを収集し、Insert時の開始位置とともに返却する
function getInstagramIdsAndStartIndex(sheet) {
  let range = sheet.getRange("A:B");
  let values = range.getValues();

  let ids = Array();
  let startIndex = null;

  // 空のセルの値だけ取得する
  for (var row = 0; row < values.length; row++) {
    // B列の情報が空 = 前回の続きのIDから取得する
    if (values[row][0] !== "" && values[row][1] === "") {
      ids.push(values[row][0]);
      
      if (startIndex === null) {
        startIndex = row + 1;
      }
    }
    // 200件に達したら抜ける
    if(ids.length >= 200) {
      break;
    }
  }
  return [ids, startIndex];
}

function getInstagramAccountData(instagramId) {
  let scriptProperties = PropertiesService.getScriptProperties();
  let env = scriptProperties.getProperties();

  let url = 'https://graph.facebook.com/v4.0/' + env.INSTAGRAM_BUSSINESS_ACCOUNT + '?fields=business_discovery.username('+instagramId+'){biography}&access_token=' + env.INSTAGRAM_API_NO_EXPIRED_TOKEN;
  
  try {
    let options = {
      muteHttpExceptions: true
    };
    let response = UrlFetchApp.fetch(encodeURI(url), options);
    let parseResponse = JSON.parse(response.getContentText());
    Logger.log('status ==> ' + response.getResponseCode());
    return parseResponse.business_discovery.biography;
  } catch(e) {
    Logger.log(e.toString());
    return '手動で確認してください。https://www.instagram.com/'+instagramId+'/';
  }
}

function getCurrentDateAsString() {
  let now = new Date();
  return Utilities.formatDate(now, "JST", "yyyy/MM/dd HH:mm:ss");
}
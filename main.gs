function handle() {
  var startTime = new Date().getTime();

  // シートから収集対象のinstagramIdを取得する
  let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet2");
  let instagramIds = getInstagramIdBySheet(sheet);

  // instagramのフォロワー数を取得
  // [instagramID, フォロワー数, 現在の日時] 形式で配列を作る
  let mappingSheet = Array();
  instagramIds.forEach(function(item, index) {
    mappingSheet.push([item, getInstagramAccountDatas(item), getCurrentDateAsString()]);
  }, this);

  // A2からCまでの範囲を取得し、mappingSheet配列をそのままSheetへ反映する
  let range = sheet.getRange(2, 1, mappingSheet.length, mappingSheet[0].length);
  range.setValues(mappingSheet);

  let endTime = new Date().getTime();
  // 処理時間の計算
  let elapsedTime = endTime - startTime;
  // 結果をログに出力する
  Logger.log("処理時間: " + elapsedTime + "ミリ秒");

}

function getInstagramIdBySheet(sheet) {
  // A列の値を取得
  var rangeValues = sheet.getRange("A1:A").getValues();
  // ２次配列を一次配列に変換
  var mapValues = rangeValues.map(function(row) {
    return row[0];
  });
  // 中身のあるものだけにする
  mapValues = mapValues.filter(function (value) {
    return value !== '' && value !== 'アカウント名';
  });
  return mapValues;
}

function getInstagramAccountDatas(instagramId) {
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
    return '手動で確認してください。https://www.instagram.com/'+instagramId+'/';
  }
}

function getCurrentDateAsString() {
  var now = new Date();
  return Utilities.formatDate(now, "JST", "yyyy/MM/dd HH:mm:ss");
}



function handle() {
  var startTime = new Date().getTime();

  // シートから収集対象かつまだ処理していないinstagramIdを取得する
  let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet2");
  let [instagramIds, startIndex, endIndex] = getInstagramIds(sheet);
  Logger.log(instagramIds);
  Logger.log(startIndex);
  Logger.log(endIndex);
  if (instagramIds.length === 0 || startIndex === 0 || endIndex === 0) {
    return 'Inputが正しくありません。';
  }

  // instagramのフォロワー数を取得
  // [instagramID, フォロワー数, 現在の日時] 形式で配列を作る
  let mappingSheet = Array();
  instagramIds.forEach(function(item, index) {
    mappingSheet.push([item, getInstagramAccountData(item), getCurrentDateAsString()]);
  }, this);

  // A2からCまでの範囲を取得し、mappingSheet配列をそのままSheetへ反映する
  // Y,X / Y,X
  // [
  //  [nintendo_jp, 任天堂の公式アカウントです。 #Nintendo #任天堂 #NintendoSwitch #ニンテンドー3DS, 2023/04/28 23:52:59], 
  //  [sony, The official Instagram account for all things Sony. Celebrating the creators, products, services, and stories that fill the world with emotion., 2023/04/28 23:53:00]
  // ]
  let range = sheet.getRange(startIndex, 1, endIndex, mappingSheet[0].length);
  range.setValues(mappingSheet);

  let endTime = new Date().getTime();
  // 処理時間の計算
  let elapsedTime = endTime - startTime;
  // 結果をログに出力する
  Logger.log("処理時間: " + elapsedTime + "ミリ秒");

}

// まだ処理されていない列だけ取得する
function getInstagramIds(sheet) {
  // 使用されている範囲を取得する（A列とB列）
  let range = sheet.getRange("A:B");
  let values = range.getValues();

  let ids = Array();
  let startIndex = null;
  let endIndex = null;
  // 空のセルの値だけ取得する
  for (var row = 0; row < values.length; row++) {
    // B列の情報が空 = 前回の続きのIDから取得する
    if (values[row][0] !== "" && values[row][1] === "") {
      ids.push(values[row][0]);
      
      if (startIndex === null) {
        startIndex = row;
      }
      endIndex = row;
    }
    // 200件に達したら抜ける
    if(ids.length >= 200) {
      break;
    }
  }
  return [ids, startIndex, endIndex];
}


function getInstagramIdBySheet(sheet) {
  // A列の値を取得
  var rangeValues = sheet.getRange("A2:A").getValues();
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
    return '手動で確認してください。https://www.instagram.com/'+instagramId+'/';
  }
}

function getCurrentDateAsString() {
  var now = new Date();
  return Utilities.formatDate(now, "JST", "yyyy/MM/dd HH:mm:ss");
}
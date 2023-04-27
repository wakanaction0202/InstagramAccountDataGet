# InstagramFollowerCountGet

## アクセストークン
### 前提
アクセストークンはPublic repositoryに上げるべきではないため、
https://developers.google.com/apps-script/reference/properties?hl=ja を参考に
GoogleスクリプトプロパティストアにアクセストークンやIDなどを登録する。

※ 仮にPublic repositoryにInstagram アクセストークンをアップすると、botが検知してInstagram アクセストークンが無効となる。

### コード内での呼び出し方
```javascript
// スクリプトプロパティを読み込むためのObjectを用意する
let scriptProperties = PropertiesService.getScriptProperties();
// スクリプトプロパティに設定されている値を一括取得する
let env = scriptProperties.getProperties();

Logger.log(env.INSTAGRAM_BUSSINESS_ACCOUNT); // 123456789987654321
```

### スクリプトプロパティに設定するキー名
- INSTAGRAM_API_NO_EXPIRED_TOKEN
  - 無期限のインスタグラムGraphAPIを発行し、登録する
- INSTAGRAM_BUSSINESS_ACCOUNT
  - InstagramのビジネスアカウントIDを登録する
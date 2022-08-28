// 占い対象の取得
const element = document.getElementsByName('item');
const value = element.value;
// 次ページに送る情報
let sendNext2 = document.getElementsByName("item");
sendNext2[0].value = value;
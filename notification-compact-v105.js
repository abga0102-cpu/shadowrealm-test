/* NOTIFICATION_COMPACT_V105
   Additive UI patch: reward notifications are smaller, slightly lower and more transparent.
   Does not alter tutorial cards, reward logic or previous patches. */
(function(){
  var css = [
    '#rewardFeed{right:8px;top:94px;width:min(210px,62%);gap:4px}',
    '.rewardPop{padding:6px 8px;border-radius:9px;background:linear-gradient(180deg,#1827415c,#0b13234d);box-shadow:0 2px 6px #0003;backdrop-filter:blur(2px);-webkit-backdrop-filter:blur(2px)}',
    '.rewardPop.boss{background:linear-gradient(180deg,#332a166e,#17120a5c);box-shadow:0 2px 7px #0003,0 0 9px #E8B44A18}',
    '.rewardPop .rpT{font-size:11.5px}',
    '.rewardPop .rpS{font-size:10.5px;line-height:1.3}',
    '.rewardPop.clickable::after{font-size:9.5px;margin-top:3px}'
  ].join('');
  var style=document.createElement('style');
  style.id='notificationCompactV105';
  style.textContent=css;
  document.head.appendChild(style);
})();

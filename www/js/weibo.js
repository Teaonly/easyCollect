(function(exports) {

  var weibo = {};

  weibo.buildListItem = function(item) {
    var html = "";
    html +=  '<a href="#" class="list-group-item well">';
    html +=  '<h6>' + item.title + '</h6>';
    html +=  '<blockquote><p>' + item.content + '</p></blockquote>';
    html +=  '</a>';
    return html;
  };

  exports['weibo'] = weibo;

})((typeof module != 'undefined' && module.exports) || g )

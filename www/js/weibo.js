(function(exports) {

  var weibo = {};

  weibo.buildListItem = function(item) {
    var html = "";
    html +=  '<div class="list-group-item well">';
    html +=  '<div class="text-right noline">';
    html +=  '<button type="button" class="btn btn-danger btn-xs">' +
             '<span class="glyphicon glyphicon-remove" aria-hidden="true"></span>' +
             '删除</button></div>';

    html +=  '<h6><a href="http://weibo.com/u/' + item.post.user_id + '" target="_blank">@' + item.post.user_name + '</a></h6>';
    html +=  '<blockquote><p>' + item.post.text + '</p></blockquote>';
    if ( item.repost !== undefined ) {
      html +=  '<div class="well">';
      html +=  '<a href="http://weibo.com/u/' + item.repost.user_id + '" target="_blank"><h6>@' + item.repost.user_name + '</h6></a>';
      html +=  '<blockquote><p>' + item.repost.text + '</p></blockquote>';
      html +=  '<p>' + item.repost.date + '</p>';
      html +=  '</div>';
    }
    html +=  '<p>' + item.post.date + '<button type="button" class="btn btn-link btn-xs">访问原站</button></p>';
    html +=  '</div>';

    return html;
  };

  exports['weibo'] = weibo;

})((typeof module != 'undefined' && module.exports) || g )

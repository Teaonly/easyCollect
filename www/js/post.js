(function(exports) {

  var post = {};

  post.buildWeibo = function(item) {
    var html = "";
    html +=  '<div class="list-group-item well collect" id="item_' + item.index + '"">';
    html +=  '<div class="text-right noline">';
    html +=  '<button type="button" class="btn btn-warning btn-xs btnDeleteCollect" index="' + item.index + '">' +
             '<span class="glyphicon glyphicon-remove" aria-hidden="true"></span>' +
             '删除</button></div>';

    html +=  '<h6><a href="http://weibo.com/u/' + item.post.user_id + '" target="_blank">@' + item.post.user_name + '</a></h6>';
    html +=  '<blockquote><p class="linkText">' + item.post.text + '</p></blockquote>';
    if ( item.repost !== undefined ) {
      html +=  '<div class="well">';
      html +=  '<h6><a href="http://weibo.com/u/' + item.repost.user_id + '" target="_blank"><h6>@' + item.repost.user_name + '</a></h6>';
      html +=  '<blockquote><p class="linkText">' + item.repost.text + '</p></blockquote>';
      html +=  '<p>' + item.repost.date + '</p>';
      html +=  '</div>';
    }
    html +=  '<p>' + item.post.date + '<button type="button" class="btn btn-link btn-xs btnAccessOrignalWeibo" index="' + item.index + '">访问原站</button></p>';

    html +=  g.tagWidget.build( item.index, item.tags, item.star );
    html +=  '</div>';

    return html;
  };

  post.buildURL = function(item) {
    var html = "";
    html +=  '<div class="list-group-item well collect" id="item_' + item.index + '"">';
    html +=  '<div class="text-right noline">';
    html +=  '<button type="button" class="btn btn-warning btn-xs btnDeleteCollect" index="' + item.index + '">' +
             '<span class="glyphicon glyphicon-remove" aria-hidden="true"></span>' +
             '删除</button></div>';

    html +=  '<h6><span class="glyphicon glyphicon-globe" aria-hidden="true"></span>网页链接</a></h6>';
    html +=  '<blockquote><p class="linkText">' + item.memo + '</p></blockquote>';

    html +=  '<p>' + item.date + '<a href="' + item.url + '" target="_blank" class="btn btn-link btn-xs">访问原站</a></p>';

    html +=  g.tagWidget.build( item.index, item.tags, item.star );

    html +=  '</div>';

    return html;
  };


  post.buildGist = function(item) {
    var html = "";
    html +=  '<div class="list-group-item well collect" id="item_' + item.index + '"">';
    html +=  '<div class="text-right noline">';
    html +=  '<button type="button" class="btn btn-warning btn-xs btnDeleteCollect" index="' + item.index + '">' +
             '<span class="glyphicon glyphicon-remove" aria-hidden="true"></span>' +
             '删除</button></div>';

    html +=  '<h6><span class="glyphicon glyphicon-file" aria-hidden="true"></span>代码片段（gist）</a></h6>';
    html +=  '<blockquote><p class="linkText">' + item.memo + '</p></blockquote>';

    html +=  '<p>' + item.date + '<button class="btn btn-link btn-xs btnViewGist" index="' + item.index + '">查看代码</button></p>';

    html +=  g.tagWidget.build( item.index, item.tags, item.star );

    html +=  '</div>';

    return html;
  }

  post.build = function(item) {
    if ( item.source === 'weibo') {
      return post.buildWeibo(item);
    } else if ( item.source === 'url') {
      return post.buildURL(item);
    } else if ( item.source === 'gist') {
      return post.buildGist(item);
    }
    var html = "";
    html +=  '<div class="list-group-item well collect" id="item_' + item.index + '"">';
    html +=  '<div class="text-right noline">';
    html +=  '<button type="button" class="btn btn-warning btn-xs btnDeleteCollect" index="' + item.index + '">' +
             '<span class="glyphicon glyphicon-remove" aria-hidden="true"></span>' +
             '删除</button></div>';
    html +=  '</div>';
    return html;
  }

  exports['post'] = post;

})((typeof module != 'undefined' && module.exports) || g )

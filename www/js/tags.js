(function(exports) {

  var tagWidget = {}

  tagWidget.build = function(index, tags) {
    /*
    <div class="bs-example" data-example-id="split-button-dropdown">
        <div class="btn-group">
          <button type="button" class="btn btn-default  btn-xs">增加标签</button>
        </div>

        <div class="btn-group">
          <a href="#" class="btn btn-link btn-xs disabled" role="button">机器学习</a>
          <button type="button" class="btn btn-link dropdown-toggle  btn-xs" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            <span class="caret"></span>
          </button>
          <ul class="dropdown-menu">
            <li><a href="#">删除</a></li>
          </ul>
        </div>

        <div class="btn-group">
          <a href="#" class="btn btn-link btn-xs disabled" role="button">计算机视觉</a>
          <button type="button" class="btn btn-link dropdown-toggle  btn-xs" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            <span class="caret"></span>
          </button>
          <ul class="dropdown-menu">
            <li><a href="#">删除</a></li>
          </ul>
        </div>
      </div>
    */

    var html = '<div data-example-id="split-button-dropdown">' +
               '<div class="btn-group">' +
               '<button type="button" class="btn btn-default btn-xs btnAddTag" index="'+ index +'">增加标签</button>' +
               '</div>';

    for(var i = 0; tags !== undefined && i < tags.length; i++) {
      html += '<div class="btn-group">' +
              '<a href="#" class="btn btn-link btn-xs disabled" role="button">'+ tags[i] +'</a>' +
              '<button type="button" class="btn btn-link dropdown-toggle btn-xs" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">' +
              '<span class="caret"></span>' +
              '</button>' +
              '<ul class="dropdown-menu">' +
              '<li><a href="#" class="btnRemove" tag="' + tags[i]+ '" index="'+ index + '">删除</a></li>' +
              '</ul>' +
              '</div>';
    }

    html += "</div>";
    return html;
  };

  exports['tagWidget'] = tagWidget;

})((typeof module != 'undefined' && module.exports) || g )

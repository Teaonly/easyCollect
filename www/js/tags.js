(function(exports) {

  var tagWidget = {}

  tagWidget.build = function(index, tags, star) {
    var html = '<div index="'+ index +'">';
    html += '<button type="button" class="btn btn-link btn-xs btnAddTag">增加标签</button>'

    if ( star === 'true' ) {
      html += '<a href="#" class="btn btn-default btn-xs btnStar"><i class="glyphicon glyphicon-star stared"></i></a>'
    } else {
      html += '<a href="#" class="btn btn-default btn-xs btnStar"><i class="glyphicon glyphicon-star-empty"></i></a>'
    }

    for(var i = 0; tags !== undefined && i < tags.length; i++) {
      html += '<button type="button" class="btn btn-info btn-xs btnRemoveTag" tagValue="'+ tags[i] +'">' + tags[i] + '<span class="glyphicon glyphicon-remove-circle"></span></button>'
    }

    html += "</div>";
    return html;
  };

  tagWidget.addTag = function( tagDiv, newTags ) {
    for (var i = 0; i < newTags.length; i++) {
      var html = '<button type="button" class="btn btn-info btn-xs  btnRemoveTag" tagValue="'+ newTags[i] +'">' + newTags[i] + '<span class="glyphicon glyphicon-remove-circle"></span></button>'
      tagDiv.append( html );
    }
  };

  exports['tagWidget'] = tagWidget;

})((typeof module != 'undefined' && module.exports) || g )

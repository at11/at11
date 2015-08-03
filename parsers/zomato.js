var cheerio = require('cheerio');
require('./parserUtil');

module.exports.parse = function(html, date, callback) {
    var $ = cheerio.load(html);
    var dayMenu = [];
    
    $('#daily-menu-container').find('.tmi-group').each(function() {
        var $this = $(this);
        
        var text = $this.children('.tmi-group-name').text();
        var day = getDay(text);
        
        if(day === date.format('dddd')){
            $this.children('.tmi-daily').each(function() {
                var text = $(this).find('.tmi-name').text().trim();

                if (!/^\d\s?[\.,]/.test(text)) { //soups dont have numbering
                    text.split('/').forEach(function(item){
                        dayMenu.push({ isSoup: true, text: item.trim(), price: NaN });
                    });
                } else {
                    var menuItem = { isSoup: false };
                    menuItem.price = parseFloat($(this).find('.tmi-price').text().replace(/,/, '.'));
                    if(isNaN(menuItem.price)){//price probably directly in text
                        text = text.replace(/\d[\.,]\d{2}$/, function(match){
                            menuItem.price = parseFloat(match.replace(',', '.'));
                            return '';
                        });
                    }
                    menuItem.text = normalize(text);
                    dayMenu.push(menuItem);
                }
            });
            return false;
        }
    });
    
    callback(dayMenu);
    
    function getDay(text) {
      var found = text.trim().match(/^(.+),/);
      if (!found || found.length < 1) {
        return null;
      }

      return found[1].toLowerCase();
    }

    function normalize(str) {
        return str.removeItemNumbering()
            .removeMetrics()
            .correctCommaSpacing()
            .normalizeWhitespace();
    }
};

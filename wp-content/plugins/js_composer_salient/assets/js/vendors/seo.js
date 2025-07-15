/* global vc, YoastSEO, _, jQuery */
(function ( $ ) {
	'use strict';
	var imageEventString, vcYoast, relevantData, eventsList;
	var initialLoad = true;
	var allImageIds = [];

	relevantData = {};
	eventsList = [
		'sync',
		'add',
		'update'
	];
	
	// nectar addition - alter how memoize is used.
	var imageFlag = false;
	
	function nectarAnalyzeContent(data) {

		// exit if in gutenburg editor.
		if ( document.body.classList.contains( 'block-editor-page' ) ) {
			return data;
		}

		var content = extractTextFromShortcodes(data);
		content = contentModification(content);

		return content;
		
	}

	function extractTextFromShortcodes(content) {
    const stack = [];
    const extractedTexts = [];
    const regex = /\[([a-zA-Z_]+)([^\]]*)\]|\[\/([a-zA-Z_]+)\]|([^[]+)/g;
    const textAttrRegex = /(?:text|text_content|quote)\s*=\s*"([^"]*)"/g;

		// ensure page is using WPBakery and not classic editor.
		const wpBakeryShortcodeRegex = /\[vc_row\b/;
		if (!wpBakeryShortcodeRegex.test(content)) {
		  return content;
		}

    let match;
    while ((match = regex.exec(content)) !== null) {
        if (match[1]) {
            // Opening shortcode tag
            const attrs = match[2];
            let attrMatch;
            // Extract text from attributes that begin with "text"
            while ((attrMatch = textAttrRegex.exec(attrs)) !== null) {
								if ( attrMatch[1].trim() !== 'true' ) {
                	extractedTexts.push(attrMatch[1].trim());
								}
            }
            stack.push({ tag: match[1], text: '' });
        } else if (match[3]) {
            // Closing shortcode tag
            let nestedContent = '';
            while (stack.length > 0) {
                const top = stack.pop();
                if (top.tag === match[3]) {
                    if (top.text.trim()) {
                        extractedTexts.push(top.text.trim());
                    }
                    break;
                } else {
                    nestedContent = top.text + nestedContent;
                }
            }
            if (stack.length > 0) {
                stack[stack.length - 1].text += nestedContent;
            }
        } else if (match[4]) {
            // Text content
            if (stack.length > 0) {
                stack[stack.length - 1].text += match[4];
            }
        }
    }

    return extractedTexts.join(' ');
}
	
	function contentModification(data) {
		
		data = _.reduce( relevantData, function ( memo, value, key ) {

			if( value.html && value.append ) {
				memo += ' ' + value.html;
			}
			else if ( value.html && value.insertAtLocation ) {
				memo = memo.replace( '"' + value.text + '"', '""]' + value.html + '[' );
			}
			else if ( value.html ) {
				memo = memo.replace( '"' + value.text + '"', value.html );
			}
      
      /* nectar addition */
      /* All image processing is handled in bulk in the imageEventString event */
      
			return memo;
			
		}, data );

		return data;
		
	}
	
	var cachedContentModification = _.memoize( function ( data ) {
		return contentModification(data);
	});
	// nectar addition end.
	

	function getImageEventString( e ) {
		/* nectar addition - add fws_image */
		return ' shortcodes:' + e + ':param:type:attach_image' + ' shortcodes:' + e + ':param:type:attach_images' + ' shortcodes:' + e + ':param:type:fws_image';
		// nectar addition end.
	}

	// add relevant data for images
	imageEventString = _.reduce( eventsList, function ( memo, e ) {
		return memo + getImageEventString( e );
	}, '' );
	vc.events.on( imageEventString, function ( model, param, settings ) {
    
		// nectar addition.
		if (initialLoad && param && param.length > 0 && param.indexOf('http') == -1 ) {
			allImageIds.push({
				id: model.get( 'id' ) + settings.param_name,
				param: param
			});
			return;
		}
		if ( param && param.length > 0 && param.indexOf('http') == -1 ) {

      $.ajax({
        type: "POST",
        url: window.ajaxurl,
        data: {
            action: "wpb_gallery_html",
            content: param,
            _vcnonce: window.vcAdminNonce
        },
        dataType: "json",
        context: this,
        success: function (html) {
          
          var htmlData = html.data;
          relevantData[model.get( 'id' ) + settings.param_name ] = {
            html: htmlData,
            append: true
          };

         	refreshSEOPlugins();
          
        }
      });
     

		}
	} );

	// Bulk load all images for first load.
	vc.events.once('shortcodeView:ready', function() {
		initialLoad = false;
		if ( allImageIds.length > 0 ) {

			const imageIds = allImageIds.map( image => image.param );

			$.ajax({
				type: "POST",
				url: window.ajaxurl,
				data: {
						action: "wpb_gallery_html",
						content: imageIds.join(','),
						_vcnonce: window.vcAdminNonce
				},
				dataType: "json",
				context: this,
				success: function (html) {

					if( !html.data ) {
						return;
					}

					// Regular expression to match image tags
					const imgTagRegex = /<img[^>]*>/g;

					// Extract image tags
					const imageTagArray = [];
					let match;
					while ((match = imgTagRegex.exec(html.data)) !== null) {
							const imgTag = match[0];
							imageTagArray.push(imgTag);
					}
					
					// replace param inside of each allImageIds with html.
					allImageIds.forEach( image => {
						if ( imageTagArray.length > 0 ) {
							relevantData[image.id] = {
								html: imageTagArray.shift(),
								append: true
							};
						}
					});

					refreshSEOPlugins();

				}});
			}
	});

	function refreshSEOPlugins() {
		if ( window.YoastSEO && typeof YoastSEO.app.refresh != 'undefined' ) {
			YoastSEO.app.refresh();
		}
		if( window.rankMathEditor && typeof rankMathEditor.refresh != 'undefined' ) {
			rankMathEditor.refresh( 'content' );
		}
	}
	


	vc.events.on( getImageEventString( 'destroy' ), function ( model, param, settings ) {
		if ( typeof relevantData[ model.get( 'id' ) + settings.param_name ] !== 'undefined') {
			delete relevantData[ model.get( 'id' ) + settings.param_name ];
		}
	} );
	
	// Add relevant data to headings
	vc.events.on( 'shortcodes:vc_custom_heading', function ( model, event ) {
		var params, tagSearch;
		params = model.get( 'params' );
		params = _.extend( {}, vc.getDefaults( model.get( 'shortcode' ) ), params );

		if ( 'destroy' === event ) {
			delete relevantData[ model.get( 'id' ) ];
		} else if ( params.text && params.font_container ) {
			tagSearch = params.font_container.match( /tag:([^\|]+)/ );
			if ( tagSearch[ 1 ] ) {
				relevantData[ model.get( 'id' ) ] = {
					html: '<' + tagSearch[ 1 ] + '>' + params.text + '</' + tagSearch[ 1 ] + '>',
					text: params.text,
					insertAtLocation: true
				};
			}
		}
	} );

	/* nectar addition - split line heading */
	vc.events.on( 'shortcodes:split_line_heading', function ( model, event ) {
		var params, tagSearch;
		params = model.get( 'params' );
		params = _.extend( {}, vc.getDefaults( model.get( 'shortcode' ) ), params );

		if ( 'destroy' === event ) {
			delete relevantData[ model.get( 'id' ) ];
		} else if ( params.animation_type && 
							params.animation_type === 'line-reveal-by-space' && 
							params.font_style && 
							params.text_content ) {
			
			var headingTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];

			if ( headingTags.indexOf(params.font_style) >= 0 ) {
				relevantData[ model.get( 'id' ) ] = {
					html: '<' + params.font_style + '>' + params.text_content + '</' + params.font_style + '>',
					text: params.text_content,
					insertAtLocation: true
				};
			}
		}
	} );

	/* nectar addition - custom elements */
	// Button.
	vc.events.on( 'shortcodes:nectar_btn', function ( model, event ) {

		var params = model.get( 'params' );
		params = _.extend( {}, vc.getDefaults( model.get( 'shortcode' ) ), params );

		if ( 'destroy' === event ) {
			delete relevantData[ model.get( 'id' ) ];
		} 
		else if ( params.url && params.text ) {
				relevantData[model.get( 'id' )] = {
					html: '<a href="'+ params.url +'">' + params.text + '</a>',
					append: true
			}
		
		}
		
	});
	
	// CTA.
	vc.events.on( 'shortcodes:nectar_cta', function ( model, event ) {
		
		var params = model.get( 'params' );
		params = _.extend( {}, vc.getDefaults( model.get( 'shortcode' ) ), params );

		if ( 'destroy' === event ) {
			delete relevantData[ model.get( 'id' ) ];
		} 
		else if ( params.url && params.link_text ) {
				relevantData[model.get( 'id' )] = {
					html: '<a href="'+ params.url +'">' + params.link_text + '</a>',
					append: true
			}
		
		}
		
	});
	
	
	// Fancy Box.
	vc.events.on( 'shortcodes:fancy_box', function ( model, event ) {

		var params = model.get( 'params' );
		params = _.extend( {}, vc.getDefaults( model.get( 'shortcode' ) ), params );
		
		if ( 'destroy' === event ) {
			delete relevantData[ model.get( 'id' ) ];
		} 
		else if ( params.link_url ) {
				relevantData[model.get( 'id' )] = {
					html: '<a href="'+ params.link_url +'"></a>',
					append: true
			}
			
		
		}
		
	});
	
	/* nectar addition end */

	$( window ).on( 'YoastSEO:ready', function () {
		var VcVendorYoast = function () {
			// init
			YoastSEO.app.registerPlugin( 'wpbVendorYoast', { status: 'ready' } );
			YoastSEO.app.pluginReady( 'wpbVendorYoast' );
			YoastSEO.app.registerModification( 'content', nectarAnalyzeContent, 'wpbVendorYoast', 5 );
		};

		vcYoast = new VcVendorYoast();
	} );
	$( document ).ready( function () {
		if ( window.wp && wp.hooks && wp.hooks.addFilter ) {
			wp.hooks.addFilter( 'rank_math_content', 'wpbRankMath', nectarAnalyzeContent );
		}
	} );
})( window.jQuery );

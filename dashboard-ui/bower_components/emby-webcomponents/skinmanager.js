define(["userSettings","events","pluginManager","backdrop","globalize","require"],function(userSettings,events,pluginManager,backdrop,globalize,require){"use strict";function getCurrentSkin(){return currentSkin}function getRequirePromise(deps){return new Promise(function(resolve,reject){require(deps,resolve)})}function loadSkin(id){var newSkin=pluginManager.plugins().filter(function(p){return p.id===id})[0];newSkin||(newSkin=pluginManager.plugins().filter(function(p){return"defaultskin"===p.id})[0]);var unloadPromise;if(currentSkin){if(currentSkin.id===newSkin.id)return Promise.resolve(currentSkin);unloadPromise=unloadSkin(currentSkin)}else unloadPromise=Promise.resolve();return unloadPromise.then(function(){var deps=newSkin.getDependencies();return console.log("Loading skin dependencies"),getRequirePromise(deps).then(function(){console.log("Skin dependencies loaded");var strings=newSkin.getTranslations?newSkin.getTranslations():[];return globalize.loadStrings({name:newSkin.id,strings:strings}).then(function(){return globalize.defaultModule(newSkin.id),loadSkinHeader(newSkin)})})})}function unloadSkin(skin){return unloadTheme(),backdrop.clear(),console.log("Unloading skin: "+skin.name),skin.unload().then(function(){document.dispatchEvent(new CustomEvent("skinunload",{detail:{name:skin.name}}))})}function loadSkinHeader(skin){return getSkinHeader(skin).then(function(headerHtml){return document.querySelector(".skinHeader").innerHTML=headerHtml,currentSkin=skin,skin.load(),skin})}function getSkinHeader(skin){return new Promise(function(resolve,reject){if(!skin.getHeaderTemplate)return void resolve("");var xhr=new XMLHttpRequest,url=skin.getHeaderTemplate();url+=url.indexOf("?")===-1?"?":"&",url+="v="+cacheParam,xhr.open("GET",url,!0),xhr.onload=function(e){resolve(this.status<400?this.response:"")},xhr.send()})}function loadUserSkin(){var skin=userSettings.get("skin",!1)||"defaultskin";loadSkin(skin).then(function(skin){Emby.Page.goHome()})}function getStylesheetPath(stylesheetPath){var embyWebComponentsBowerPath="bower_components/emby-webcomponents";switch(stylesheetPath){case"theme-dark":return require.toUrl(embyWebComponentsBowerPath+"/themes/dark/theme.css");case"theme-light":return require.toUrl(embyWebComponentsBowerPath+"/themes/light/theme.css");default:return stylesheetPath}}function unloadTheme(){var elem=themeStyleElement;elem&&(elem.parentNode.removeChild(elem),themeStyleElement=null,currentThemeStylesheet=null)}function setTheme(stylesheetPath){return new Promise(function(resolve,reject){var linkUrl=getStylesheetPath(stylesheetPath);if(currentThemeStylesheet===linkUrl)return void resolve();unloadTheme();var link=document.createElement("link");link.setAttribute("rel","stylesheet"),link.setAttribute("type","text/css"),link.onload=resolve,link.setAttribute("href",linkUrl),document.head.appendChild(link),themeStyleElement=link,currentThemeStylesheet=linkUrl})}var currentSkin,cacheParam=(new Date).getTime();events.on(userSettings,"change",function(e,name){"skin"!==name&&"language"!==name||loadUserSkin()});var themeStyleElement,currentThemeStylesheet;return{getCurrentSkin:getCurrentSkin,loadSkin:loadSkin,loadUserSkin:loadUserSkin,setTheme:setTheme}});
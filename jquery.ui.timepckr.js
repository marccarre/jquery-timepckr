/*******************************************************************************
 * Copyright 2013 Marc CARRE
 * https://github.com/marccarre/jquery-timepckr
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ******************************************************************************/

/*
 * NOTE: I only learnt JavaScript a few days before writing this plugin
 * and this was the first time I used jQuery as well, so please don't blame
 * me too much for any design/implementation mistakes, but feel free to improve
 * this plugin. 
 * And if you do so, please don't hesitate to send me your version so I can learn 
 * from your work, and if you want, publish your new version, once merged with mine.
 * This is why there are opensource softwares after all, isn't it?
 * 
 * TODOLIST:
 * - Be able to set the options to modify the default behaviour.
 * - Really create a 12h/24h mode.
 */

(function($) {
    $.widget("ui.timepckr", {

        options: {
            convention: "24",
            defaultTimePeriod: "A.M.",
            defaultHour: "00",
            defaultMinute: "00",
            arrayTimePeriods: ["A.M.", "P.M."],
            arrayHours: ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"],
            arrayMinutes: ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"]
        },

        _create: function() {  
            var self = this,  
                o = self.options,  
                container = self.element,
                listTP = this._generateTimePeriodsHTML(o.arrayTimePeriods),
                listHours = this._generateHoursHTML(o.arrayHours),
                listMinutes = this._generateMinutesHTML(o.arrayMinutes),
                timePckr = this._generateHTML(container,listTP,listHours,listMinutes).insertAfter(container),
                hoursMapper = new HoursMapper(o.convention),
                tp = o.defaultTimePeriod,
                hour = o.defaultHour,
                minute = o.defaultMinute,
                isVisible = false,
                // Used to keep the track of the last selected values.
                lastTPElem = null,
                lastTPValue = null,
                lastHourElem = null,
                lastHourValue = null,
                lastMinuteElem = null,
                lastMinuteValue = null;

            //refreshTime(container, hour, minute);
            isVisible = hideTimePckr(timePckr);

            /*************************************************** Container Events */
            container.click(function(event) {
                if (isVisible) {
                    isVisible = hideTimePckr(timePckr);
                } else {
                    isVisible = showTimePckr(timePckr);
                }
            });
            // Hide the timePckr when leaving it and focusing somewhere else.
            container.focusout(function(event) {
                isVisible = hideTimePckr(timePckr);
            });
            
            /******************************************* List Time-Periods Events */
            listTP.children().each(function() {

                $(this).click(function(event) {
                    isVisible = hideTimePckr(timePckr);
                });

                $(this).mouseenter(function(event) {
                    // Add the "hovered" state to the current element and remove it from the last element.
                    $(this).addClass("ui-state-hover");
                    if ((lastTPElem != null) && (lastTPValue != $(this).html())) {
                        lastTPElem.removeClass("ui-state-hover");
                    }
                    // Refresh the current time.
                    tp = $(this).html(); // "A.M." or "P.M."
                    hour = hoursMapper.getRealHour(hour, tp); // "00", ..., "23"
                    refreshTime(container, hour, minute);
                });

                $(this).mouseleave(function(event) {
                    // Set the left element as the last element.
                    lastTPElem = $(this);
                    lastTPValue = $(this).html();
                });
            });

            /************************************************** List Hours Events */
            listHours.children().each(function() {

                $(this).click(function(event) {
                    isVisible = hideTimePckr(timePckr);
                });

                $(this).mouseenter(function(event) {
                    // Add the "hovered" state to the current element and remove it from the last element.
                    $(this).addClass("ui-state-hover");
                    if ((lastHourElem != null) && (lastHourValue != $(this).html())) {
                        lastHourElem.removeClass("ui-state-hover");
                    }
                    // Refresh the current time.
                    hour = hoursMapper.getRealHour($(this).html(), tp); // "00", ..., "23"
                    refreshTime(container, hour, minute);
                });

                $(this).mouseleave(function(event) {
                    // Set the left element as the last element.
                    lastHourElem = $(this);
                    lastHourValue = $(this).html();
                });
            });

            /************************************************ List Minutes Events */
            listMinutes.children().each(function() {

                $(this).click(function(event) {
                    isVisible = hideTimePckr(timePckr);
                });

                $(this).mouseenter(function(event) {
                    // Add the "hovered" state to the current element and remove it from the last element.
                    $(this).addClass("ui-state-hover");
                    if ((lastMinuteElem != null) && (lastMinuteValue != $(this).html())) {
                        lastMinuteElem.removeClass("ui-state-hover");
                    }
                    // Refresh the current time.
                    minute = ($(this).html()); // "00", "15", "30", "45"
                    refreshTime(container, hour, minute);
                });

                $(this).mouseleave(function(event) {
                    // Set the left element as the last element.
                    lastMinuteElem = $(this);
                    lastMinuteValue = $(this).html();
                });
            });

            /************************************************** Private functions */
            function showTimePckr(timePckr) {
                timePckr.show();
                return true;
            };

            function hideTimePckr(timePckr) {
                timePckr.hide();
                return false;
            };

            function refreshTime(container, hour, minute) {
                container.val(formatTime(hour, minute));
            };

            function formatTime(hour, minute) {
                return (hour + ":" + minute);
            };
        },  
        
        _generateHTML: function(container, timePeriods, hours, minutes) {
            var span = $("<span></span>");
            span.addClass("ui-timePckr").addClass("ui-helper-reset").addClass("ui-widget");
            span.css("position", "absolute").css("left", container.position().left);
            // Set the timePckr on the top from the container using z-index CSS property.
            var z = container.css("z-index");
            var zValue = z.match(/[0-9]*/);
            if ((zValue != null) && (zValue != "")) {
                span.css("z-index", parseInt(zValue + 1));
            }
            span.append(timePeriods).append(hours).append(minutes);
            return span;
        },

        _generateTimePeriodsHTML: function(timePeriods) { //default timePeriods: ["A.M.", "P.M."]
            var ol = $("<ol></ol>");
            ol.addClass("ui-timePckr-p-ol").addClass("ui-helper-clearfix");

            if ((timePeriods === undefined) || (timePeriods == null))
                return ol;

            for (var i=0, j=timePeriods.length; i<j; i++) {
                var li = $("<li></li>");
                li.addClass("ui-timePckr-p-li").addClass("ui-state-default");
                li.append(timePeriods[i]);
                ol.append(li);
            }
            return ol;
        },

        _generateHoursHTML: function(hours) { //default hours: ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"]
            var ol = $("<ol></ol>");
            ol.addClass("ui-timePckr-h-ol").addClass("ui-helper-clearfix");

            if ((hours === undefined) || (hours == null))
                return ol;

            for (var i=0, j=hours.length; i<j; i++) {
                var li = $("<li></li>");
                li.addClass("ui-timePckr-h-li").addClass("ui-state-default");
                li.append(hours[i]);
                ol.append(li);
            }
            return ol;
        },

        _generateMinutesHTML: function(minutes) { //default minutes: ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"]
            var ol = $("<ol></ol>");
            ol.addClass("ui-timePckr-m-ol").addClass("ui-helper-clearfix");

            if ((minutes === undefined) || (minutes == null))
                return ol;

            for (var i=0, j=minutes.length; i<j; i++) {
                var li = $("<li></li>");
                li.addClass("ui-timePckr-m-li").addClass("ui-state-default");
                li.append(minutes[i]);
                ol.append(li);
            }
            return ol;
        },

        //TODO: Be able to set the options.
        _setOption: function(option, value) {
            $.Widget.prototype._setOption.apply( this, arguments );  
        
            var container = this.element,  
                timePicker = container.next();
        
            switch (option) {
                case "convention":
                    break;
                case "defaultTimePeriod":
                    break;
                case "defaultHour":
                    break;
                case "defaultMinute":
                    break;
                case "arrayTimePeriods":
                    break;
                case "arrayHours":
                    break;
                case "arrayMinutes":
                    break;
            }
        },

        destroy: function() {  
            this.element.next().remove();  
        }

    });

    /******************************************** HoursMapper Prototype Object:
     * The HoursMapper Prototype Object allow you to build HoursMapper objects:
     * HoursMappers can be used to simply convert hours from a 12-hours format
     * to a 24-hours format, and vice-versa.
     */
    HoursMapper = function(convention) {
        this.convention = this.getConvention(convention);
        this.hoursAM = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
        this.hoursPM = ["13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "00"];
    };

    /* Secure the convention used as a parameter to be only "12" or "24".
     * If the input isn't correct, set "24" as a default value.
     */
    HoursMapper.prototype.getConvention = function(convention) {
        if ((convention != "12") || (convention != "24")) {
            return "24";
        }
        return convention;
    };

    /* Find the "real hour" corresponding to the specified hour and timePeriod
     * based on the convention set when creating the HoursMapper.
     */
    HoursMapper.prototype.getRealHour = function(hour, timePeriod) {
        // Check parameters.
        if ((timePeriod === undefined) || ((timePeriod != "A.M.") && (timePeriod != "P.M."))) {
            return;
        }
        var index = this.getIndex(hour);
        if (index == -1) 
            return;
        
        // Return the "real" hour.
        if (this.convention == "12") {  // It will always between 01 and 12.
            return this.hoursAM[index];
        } else { // (this.convention == "24"): It can be between 01 and 12, or 13 and 00.
            if (timePeriod == "A.M.") {
                if (index == 11) {
                    return "00";
                } else {
                    return this.hoursAM[index];
                }
            } else {
                if (index == 11) {
                    return "12";
                } else {
                    return this.hoursPM[index];
                }
            }
        }
    };

    /* Return the index of the hour given as a parameter within the hours arrays.
     * Return -1 if not found.
     */
    HoursMapper.prototype.getIndex = function(hour) {
        for (var i=0, j=this.hoursAM.length; i<j; i++) {
            if (this.hoursAM[i] == hour)
                return i;
        }
        for (var i=0, j=this.hoursPM.length; i<j; i++) {
            if (this.hoursPM[i] == hour)
                return i;
        }
        return (-1);
    };

})(jQuery);
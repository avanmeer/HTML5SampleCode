// JavaScript source code
$(document).ready(function () {

    ui = {
        ShowDiv: function (id) {
            document.getElementById(id).style.display = "inline";
        },
        HideDiv: function (id) {
            document.getElementById(id).style.display = "none";
        },
        ClearDiv: function (id) {
            $(id).empty();
        },
        ClearFileUpload(id) {
            $(id).fileupload("clear");
        },
        HideControl: function (id) {
            $(id).hide();
        },
        ShowControl: function (id) {
            $(id).show();
        },
        ShowLoadingIcon: function () {
            $('#loading').html("<img src='images/processing.gif'/>");
        },
        RemoveLoadingIcon: function(){
            $('#loading').html("");
        },
        ShowErrorDescription: function (errorDesc) {
            $('#errorDiv').html("<p>Acuant Error Code: " + errorDesc + "</p>");
        },
        DisplayField: function (fieldName, fieldValue) {
            if (fieldName == "Address Verification" || fieldName == "ID Verification") {
                var string = "<div class=\"form-group\">";
                string += "<label class=\"col-md-4 control-label\">";
                string += fieldName;
                string += "</label>";
                string += "<div class=\"col-md-7\">";
                string += "<p class=\"form-control text-center\">";
                string += fieldValue;
                string += "</p>";
                string += "</div>";
                string += "</div>";
                return string;
            }
            else if (fieldValue) {
                var string = "<div class=\"form-group\">";
                string += "<label class=\"col-md-4 control-label\">";
                string += fieldName;
                string += "</label>";
                string += "<div class=\"col-md-7\">";
                string += "<p class=\"form-control text-center\">";
                string += fieldValue;
                string += "</p>";
                string += "</div>";
                string += "</div>";
                return string;
            }
            else
                return "";
        },
        SetSrcImage: function (id, base64data) {
            $(id).attr("src", "data:image/jpg;base64," + base64data);
        }



    };

});
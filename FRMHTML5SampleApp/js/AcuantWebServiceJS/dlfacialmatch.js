$(document).ready(function () {

    $('input[type="checkbox"]').not('#create-switch').bootstrapSwitch();

    //Detect type of device.
    var isMobile = {
        Android: function () {
            return navigator.userAgent.match(/Android/i);
        },
        BlackBerry: function () {
            return navigator.userAgent.match(/BlackBerry/i);
        },
        iOS: function () {
            return navigator.userAgent.match(/iPhone|iPad|iPod/i);
        },
        Opera: function () {
            return navigator.userAgent.match(/Opera Mini/i);
        },
        Windows: function () {
            return navigator.userAgent.match(/IEMobile/i);
        },
        any: function () {
            return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
        }
    };


    // Convert dataURL to Blob object
    function dataURLtoBlob(dataURL) {
        // Decode the dataURL    
        var binary = atob(dataURL.split(',')[1]);
        // Create 8-bit unsigned array
        var array = [];
        for (var i = 0; i < binary.length; i++) {
            array.push(binary.charCodeAt(i));
        }
        // Return our Blob object
        return new Blob([new Uint8Array(array)], { type: 'image/jpg' });
    }

    //Format data displayed to UI.
    function AddDisplay(fieldName, fieldValue) {

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
    };

    //Clears populated controls. Prepares UI for next processing.
    function ResetControls() {
        document.getElementById("facialMatchResponse").style.display = "none";
        $('#facial-match-response').empty();
    };

    //Clears controls and opens File Dialog to chose input image
    $("#placehold-image-face1").click(function () {
        $("#input-image-face1").click();
        document.getElementById("facialMatchResponse").style.display = "none";
        $('#facial-match-response').empty();
        $('#loading').empty();
        $("#div-controls").show();
    });

    //Clears controls and opens File Dialog to chose input image
    $("#placehold-image-selfie").click(function () {
        $("#input-image-selfie").click();
        document.getElementById("facialMatchResponse").style.display = "none";
        $('#facial-match-response').empty();
        $('#loading').empty();
        $("#div-controls").show();
    });

    //Clears controls and opens File Dialog after choosing an input image
    $("#image-thumbnail-face1").click(function () {
        $("#input-image-face1").click();
        document.getElementById("facialMatchResponse").style.display = "none";
        $('#facial-match-response').empty();
        $('#errorDiv').empty();
        $('#loading').empty();
        $("#div-controls").show();
        $("#fileupload-container-face1").fileupload("clear");
    });

    //Clears controls and opens File Dialog after choosing an input image
    $("#image-thumbnail-selfie").click(function () {
        $("#input-image-selfie").click();
        document.getElementById("facialMatchResponse").style.display = "none";
        $('#facial-match-response').empty();
        $('#errorDiv').empty();
        $('#loading').empty();
        $("#div-controls").show();
        $("#fileupload-container-selfie").fileupload("clear");
    });

    var unmodifiedFace1;
    //Resize image
    $('#input-image-face1').change(function (e) {
        var file = e.target.files[0];

        var reader = new FileReader();
        reader.readAsDataURL(file);
        canvasResize(file, {
            isPreprocessing: false,
            isiOS: isMobile.iOS(),
            cardType: "",
            callback: function (data, width, height) {
                unmodifiedFace1 = dataURLtoBlob(data);
            }
        });
    });

    var unmodifiedSelfie;
    //Resize image
    $('#input-image-selfie').change(function (e) {
        var file = e.target.files[0];

        var reader = new FileReader();
        reader.readAsDataURL(file);
        canvasResize(file, {
            isPreprocessing: false,
            isiOS: isMobile.iOS(),
            cardType: "",
            callback: function (data, width, height) {
                unmodifiedSelfie = dataURLtoBlob(data);
            }
        });
    });

    $("#btn-process-facial-match").click(function () {
        ResetControls();

        var imgFace1 = $('#input-image-face1').val();
        var imgSelfie = $('#input-image-selfie').val();

        $('#diplay-div').empty();
        $('#div-img').empty();

        $('#errorDiv').empty();
        $('#loading').empty();

        if (imgSelfie == '' || imgFace1 == '') {
            alert("Both the face images are required.");
            return;
        }

        facialMatchData = new FormData();
        facialMatchData.append("idFaceImage", unmodifiedFace1);
        facialMatchData.append("selfieImage", unmodifiedSelfie);

        $.ajax({
            type: "POST",
            url: "https://cssnwebservices.com/CSSNService/CardProcessor/FacialMatch",
            data: facialMatchData,
            cache: false,
            contentType: 'application/octet-stream; charset=utf-8;',
            dataType: "json",
            processData: false,
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", "LicenseKey " + authinfo);
                $('#loading').html("<img src='images/processing.gif'/>");
                $("#div-controls").show();
            },
            success: function (data) {

                //Convert data to string before parsing
                var response = JSON.stringify(data);
                response = jQuery.parseJSON(response);

                //Checking if there are errors returned.
                if (response.ResponseCodeAuthorization < 0) {
                    $('#errorDiv').html("<p>Acuant Error Code: " + response.ResponseMessageAuthorization + "</p>");
                }
                else if (response.WebResponseCode < 1) {
                    $('#errorDiv').html("<p>Acuant Error Code: " + response.WebResponseDescription + "</p>");
                }
                else {

                    //Display data returned by the web service
                    var data = AddDisplay("Facial Match", response.FacialMatch.toString());
                    data += AddDisplay("Facial Match Confidence Rating", response.FacialMatchConfidenceRating.toString());

                    $(data).appendTo("#facial-match-response");
                    document.getElementById("facialMatchResponse").style.display = "inline";
                }
            },
            error: function (e) {
                $('#errorDiv').html("Error: " + e);
                $("#div-controls").hide();
            },
            complete: function (e) {
                $('#loading').html("");
                $("#div-controls").hide();
            }
        });
    });
});
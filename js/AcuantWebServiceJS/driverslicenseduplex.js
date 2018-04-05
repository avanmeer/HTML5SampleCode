$(document).ready(function () {

    $('input[type="checkbox"]').not('#create-switch').bootstrapSwitch();
    $("#rdoFront").prop("checked", true)
    $("#rdoFront").parent().addClass("active");

    //These variables are for capturing images using webcam.
    //The images captured should be copied to the canvas to keep their resolutions.
    var video = document.querySelector('#webcam');
    var capturedcanvas = document.querySelector('#captured-canvas');
    var blankCanvasFront = document.querySelector('#blank-canvas-front');
    var blankContextFront = blankCanvasFront.getContext('2d');
    var selectedCanvasFront = document.querySelector('#selected-canvas-front');
    var selectedCanvasBack = document.querySelector('#selected-canvas-back');
    var contextCapturedCanvas = capturedcanvas.getContext('2d');

    var contextCanvasBack = selectedCanvasBack.getContext('2d');

    if (isMobile.any()) {
        $("#option-source").hide();
        $("#container-camera").show();
        $("#container-webcam").hide();
        $('#chkPreProcessing').bootstrapSwitch('setState', true);
    }
    else {

        //Change to .show() to enable webcam feature.
        $("#option-source").hide();

        //Remove comment to enable webcam feature
        //Prompts the user for permission to use a webcam.
        //                navigator.getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
        //                if (navigator.getUserMedia) {
        //                    navigator.getUserMedia
        //                                    (
        //                                      { video: true },
        //                                      function (localMediaStream) {
        //                                          video.src = window.URL.createObjectURL(localMediaStream);
        //                                      }, onFailure);
        //                }

        //        $("#help-icon").tooltip({ placement: 'bottom' });
        //        $('#chkPreProcessing').bootstrapSwitch('setState', false);
    }

    //Toggles UI between using fileupload or webcam as image input
    var isSourceCameraOrDisk = $('#chkImageSource').is(':checked') ? true : false;
    if (isSourceCameraOrDisk) {
        $("#container-camera").show();
        $("#container-webcam").hide();
    }
    else {
        $("#container-camera").hide();
        $("#container-webcam").show();
    }

    var assureIDEnabled = false;
    checkLicense(); // Check if AssureID is enabled on the license key or not. This will affect on what size of the image will be sent to the Web Services. For AssureID, a bigger (width, height) image needs to be sent.

    function checkLicense() {

        var promise = acuantWebservice.GetLicenseDetails();

        promise.error(function (response) {
            var error = jQuery.parseJSON(JSON.stringify(response));
            $('#errorDiv').html("Error: " + JSON.stringify(error.status + " " + error.statusText));
        });

        promise.done(function (response) {

            var licenseDetail = JSON.stringify(response);
            licenseDetail = jQuery.parseJSON(licenseDetail);

            if (licenseDetail.ResponseCodeAuthorization < 0) {
                ui.ShowErrorDescription(licenseDetail.ResponseMessageAuthorization);
            }
            else {
                if (licenseDetail.AssureIDAllowed == true) {
                    assureIDEnabled = true;
                }
            }
        });
    }

    function onFailure(err) {
        //The developer can provide any alert messages here once permission is denied to use the webcam.
    }

    function cloneCanvas(oldCanvas) {
        var newCanvas;

        if ($("#rdoFront").parent().hasClass("active"))
            newCanvas = document.querySelector('#selected-canvas-front');
        else
            newCanvas = document.querySelector('#selected-canvas-back');
        //create a new canvas
        //var newCanvas = document.createElement('canvas');
        var context = newCanvas.getContext('2d');

        //set dimensions
        newCanvas.width = oldCanvas.width;
        newCanvas.height = oldCanvas.height;

        //apply the old canvas to the new one
        context.drawImage(oldCanvas, 0, 0);

        //return the new canvas
        return newCanvas;
    }

    //Display the image to the canvas upon capturing image from webcam.
    function snapshot() {
        capturedcanvas.width = video.videoWidth;
        capturedcanvas.height = video.videoHeight;
        contextCapturedCanvas.drawImage(video, 0, 0);
    }

    //Clears populated controls. Prepares UI for next processing.
    function ResetControls() {
        $('#extractedData').hide();
        $('#drivers-license-data').empty();
    };

    //Toggles UI between using fileupload or webcam when the checkbox has been changed.
    $("#chkImageSource").change(function () {
        if (this.checked) {
            $("#container-camera").show()
            $("#container-webcam").hide()
        }
        else {
            $("#container-camera").hide()
            $("#container-webcam").show()
        }
    });

    //Accept captured image from webcam and display on canvas.
    $("#btn-use-image").click(function () {
        cloneCanvas(capturedcanvas);
        $('#myModal').modal("hide");
    });

    //Clicks on webcam area to capture image.
    $("#webcam").click(function () {
        snapshot();
        $('#myModal').modal()
        $("#div-controls").show();
    });

    //Clears controls and opens File Dialog to chose input image
    $("#placehold-image-front").click(function () {
        $("#input-image-front").click();
        $('#faceImage').hide();
        $('#signImage').hide();
        $('#extractedData').hide();
        $('#drivers-license-data').empty();
        $('#loading').empty();
        $("#div-controls").show();
    });

    //Clears controls and opens File Dialog to chose input image
    $("#placehold-image-back").click(function () {
        $("#input-image-back").click();
        $('#faceImage').hide();
        $('#signImage').hide();
        $('#extractedData').hide();
        $('#drivers-license-data').empty();
        $('#loading').empty();
        $("#div-controls").show();
    });

    //Clears controls and opens File Dialog after choosing an input image
    $("#image-thumbnail-front").click(function () {
        $("#input-image-front").click();
        $('#faceImage').hide();
        $('#signImage').hide();
        $('#extractedData').hide();
        $('#drivers-license-data').empty();
        $('#errorDiv').empty();
        $('#loading').empty();
        $("#div-controls").show();
        $("#fileupload-container-back").show();
        $("#container-camera > div > div:first-child").attr('class', 'col-xs-12 col-sm-6 col-lg-6');
        $("#fileupload-container-front").fileupload("clear");
    });

    //Clears controls and opens File Dialog after choosing an input image
    $("#image-thumbnail-back").click(function () {
        $("#input-image-back").click();
        $('#faceImage').hide();
        $('#signImage').hide();
        $('#extractedData').hide();
        $('#drivers-license-data').empty();
        $('#errorDiv').empty();
        $('#loading').empty();
        $("#div-controls").show();
        $("#fileupload-container-back").fileupload("clear");
    });

    var preprocessedFrontImage;
    var unmodifiedFrontImage;
    //Resize image
    $('#input-image-front').change(function (e) {
        var file = e.target.files[0];

        var maxWidth = 2048;
        var maxHeight = 1536;

        if (assureIDEnabled) {
            // If the AssureID is enabled, increase the size of the image sent to the Web Services
            maxWidth = 3032;
            maxHeight = 2008;
        }

        canvasResize(file, {
            crop: false,
            quality: 75,
            isiOS: isMobile.iOS(),
            isPreprocessing: true,
            cardType: "DriversLicenseDuplex",
            maxW: maxWidth,
            maxH: maxHeight,
            callback: function (data, width, height) {
                preprocessedFrontImage = utilities.DataUrlToBlob(data);
            }
        });

        canvasResize(file, {
            isPreprocessing: false,
            isiOS: isMobile.iOS(),
            cardType: "DriversLicenseDuplex",
            maxW: maxWidth,
            maxH: maxHeight,
            callback: function (data, width, height) {
                unmodifiedFrontImage = utilities.DataUrlToBlob(data);
            }
        });
    });

    var preprocessedBackImage;
    var unmodifiedBackImage;
    //Resize image
    $('#input-image-back').change(function (e) {
        var file = e.target.files[0];
        var maxWidth = 2048;
        var maxHeight = 1536;

        if (assureIDEnabled) {
            // If the AssureID is enabled, increase the size of the image sent to the Web Services
            maxWidth = 3032;
            maxHeight = 2008;
        }

        canvasResize(file, {
            crop: false,
            quality: 75,
            isPreprocessing: true,
            isiOS: isMobile.iOS(),
            cardType: "DriversLicenseDuplex",
            maxW: maxWidth,
            maxH: maxHeight,
            callback: function (data, width, height) {
                preprocessedBackImage = utilities.DataUrlToBlob(data);
            }
        });

        canvasResize(file, {
            isPreprocessing: false,
            isiOS: isMobile.iOS(),
            cardType: "DriversLicenseDuplex",
            maxW: maxWidth,
            maxH: maxHeight,
            callback: function (data, width, height) {
                unmodifiedBackImage = utilities.DataUrlToBlob(data);
            }
        });
    });

    $("#btn-process-image").click(function () {

        ResetControls();
        var isSourceCameraOrDisk = $('#chkImageSource').is(':checked') ? true : false;
        var usePreprocessing = $('#chkPreProcessing').is(':checked') ? true : false;
        var imageSource = $("#imageSource-select").val();

        var selectedRegion = $("#region-select").val();
        var imageToProcess;
        var imgValFront = $('#input-image-front').val();
        var imgValBack = $('#input-image-back').val();

        $('#diplay-div').empty();
        $('#div-img').empty();
        $('#errorDiv').empty();
        $('#loading').empty();

        var dataUrl;
        var image;

        if (isSourceCameraOrDisk) {
            if (imgValFront == '') {
                alert("Front side image required.");
                return;
            }

            if (imgValBack == '') {
                alert("Back side image required.");
                return;
            }

            imageToProcess = new FormData();

            if (usePreprocessing) {
                imageToProcess.append("frontImage", preprocessedFrontImage);
                imageToProcess.append("backImage", preprocessedBackImage);
            }
            else {
                imageToProcess.append("frontImage", unmodifiedFrontImage);
                imageToProcess.append("backImage", unmodifiedBackImage);
            }
        }
        else {
            imageToProcess = new FormData();
            dataUrl = selectedCanvasFront.toDataURL();
            image = dataURLtoBlob(dataUrl);
            var blankDataUrl = blankCanvasFront.toDataURL();

            if (dataUrl == blankDataUrl) {
                alert("Capture image first before processing.");
                return;
            }
            //imageToProcess = image;
            imageToProcess.append("files", image);

            dataUrl = selectedCanvasBack.toDataURL();

            if (dataUrl == blankDataUrl) {
                alert("Capture back image before processing.");
                return;
            }
            else {
                image = dataURLtoBlob(dataUrl);
                imageToProcess.append("files", image);
            }
        }

        //Access web service
        var promise = acuantWebservice.ProcessDLDuplex(imageToProcess, selectedRegion, imageSource, usePreprocessing);

        promise.error(function (response) {

            var error = jQuery.parseJSON(JSON.stringify(response));
            $('#errorDiv').html("Error: " + JSON.stringify(error.status + " " + error.statusText));
        });

        promise.done(function (response) {

            var driversLicense = JSON.stringify(response);
            driversLicense = jQuery.parseJSON(driversLicense);

            //Checking if there are errors returned.
            if (driversLicense.ResponseCodeAuthorization < 0) {
                ui.ShowErrorDescription(driversLicense.ResponseMessageAuthorization);
            }
            else if (driversLicense.ResponseCodeAutoDetectState < 0) {
                ui.ShowErrorDescription(driversLicense.ResponseCodeAutoDetectStateDesc);
            }
            else if (driversLicense.ResponseCodeProcState < 0) {
                ui.ShowErrorDescription(driversLicense.ResponseCodeProcStateDesc);
            }
            else if (driversLicense.WebResponseCode < 1) {
                ui.ShowErrorDescription(driversLicense.WebResponseDescription);
            }
            else {

                //Display data returned by the web service
                var data = ui.DisplayField("First Name", driversLicense.NameFirst);
                data += ui.DisplayField("Middle Name", driversLicense.NameMiddle);
                data += ui.DisplayField("Last Name", driversLicense.NameLast);
                data += ui.DisplayField("License Number", driversLicense.license);
                data += ui.DisplayField("Address", driversLicense.Address);
                data += ui.DisplayField("City", driversLicense.City);
                data += ui.DisplayField("State", driversLicense.State);
                data += ui.DisplayField("Zip", driversLicense.Zip);
                data += ui.DisplayField("Country", driversLicense.IdCountry);
                data += ui.DisplayField("Expiration Date", driversLicense.ExpirationDate4);
                data += ui.DisplayField("Issue Date", driversLicense.IssueDate4);
                data += ui.DisplayField("Date Of Birth", driversLicense.DateOfBirth4);
                data += ui.DisplayField("Sex", driversLicense.Sex);
                data += ui.DisplayField("Eyes Color", driversLicense.Eyes);
                data += ui.DisplayField("Hair Color", driversLicense.Hair);
                data += ui.DisplayField("Height", driversLicense.Height);
                data += ui.DisplayField("Weight", driversLicense.Weight);
                data += ui.DisplayField("Class", driversLicense.Class);
                data += ui.DisplayField("Restriction", driversLicense.Restriction);
                data += ui.DisplayField("Endorsements", driversLicense.Endorsements);
               
                if (driversLicense.AuthenticationResult != null) {
                    data += ui.DisplayField("Authentication Result", driversLicense.AuthenticationResult);
                    if (driversLicense.AuthenticationResult == "Attention" || driversLicense.AuthenticationResult == "Unknown") // AuthenticationResultSummary is only populated if the AuthenticationResult is "Attention"
                    {
                        data += ui.DisplayField("Authentication Result Summary", driversLicense.AuthenticationResultSummary);
                    }
                }

                $(data).appendTo("#drivers-license-data");
                $("#extractedData").show();

                //Comment this line of code if returnBackImage is set to 'true'
                $("#fileupload-container-back").fileupload("clear");

                //Display face, sign and reformatted images on UI
                var faceImage = driversLicense.FaceImage;
                if (faceImage != null && faceImage != "") {
                    var base64FaceImage = goog.crypt.base64.encodeByteArray(faceImage);

                    $('#faceImage').show();
                    $("#face-image").attr("src", "data:image/jpg;base64," + base64FaceImage);
                }

                var signImage = driversLicense.SignImage;
                if (signImage != null && signImage != "") {
                    var base64SignImage = goog.crypt.base64.encodeByteArray(signImage);

                    $('#signImage').show();
                    $("#signature-image").attr("src", "data:image/jpg;base64," + base64SignImage);
                }

                var reformattedImageFront = driversLicense.ReformattedImage;
                if (reformattedImageFront != null && reformattedImageFront != "") {
                    var base64ReformattedImage = goog.crypt.base64.encodeByteArray(reformattedImageFront);

                    $("#image-thumbnail-front img:first-child").attr("src", "data:image/jpg;base64," + base64ReformattedImage);
                    $("#fileupload-container-back").hide();
                    $("#container-camera > div > div:first-child").attr('class', 'col-xs-12 col-sm-12 col-lg-12');
                }

                var reformattedImageBack = driversLicense.ReformattedImageTwo;
                if (reformattedImageBack != null && reformattedImageBack != "") {
                    var base64ReformattedImage = goog.crypt.base64.encodeByteArray(reformattedImageBack);

                    $("#image-thumbnail-back img:first-child").attr("src", "data:image/jpg;base64," + base64ReformattedImage);
                }


            }

            promise.always(function () {
                ui.RemoveLoadingIcon();
                $("#div-controls").hide();
            });
        });
    });

});
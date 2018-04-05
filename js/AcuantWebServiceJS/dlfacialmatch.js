$(document).ready(function () {

    $('input[type="checkbox"]').not('#create-switch').bootstrapSwitch();

    if (isMobile.any()) {
        $('#chkPreProcessing').bootstrapSwitch('setState', true);
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

    //Clears populated controls. Prepares UI for next processing.
    function ResetControls() {
        $('#extractedData').hide();
        $('#facialMatchResponse').hide();
        $('#drivers-license-data').empty();
        $('#facial-match-response').empty();
    };

    //Clears controls and opens File Dialog to chose input image
    $("#placehold-image-id").click(function () {
        $("#input-image-id").click();

        $('#facialMatchResponse').hide();
        $('#extractedData').hide();
        $('#faceImage').hide();
        $('#selfie').hide();
        $('#signImage').hide();

        $('#drivers-license-data').empty();
        $('#facial-match-response').empty();
        $('#loading').empty();
        $("#div-controls").show();
    });

    //Clears controls and opens File Dialog to chose input image
    $("#placehold-image-selfie").click(function () {
        $("#input-image-selfie").click();

        $('#facialMatchResponse').hide();
        $('#extractedData').hide();
        $('#faceImage').hide();
        $('#selfie').hide();
        $('#signImage').hide();

        $('#drivers-license-data').empty();
        $('#facial-match-response').empty();
        $('#loading').empty();
        $("#div-controls").show();
    });

    //Clears controls and opens File Dialog after choosing an input image
    $("#image-thumbnail-id").click(function () {
        $("#input-image-id").click();

        $('#facialMatchResponse').hide();
        $('#extractedData').hide();
        $('#faceImage').hide();
        $('#selfie').hide();
        $('#signImage').hide();

        $('#drivers-license-data').empty();
        $('#facial-match-response').empty();
        $('#errorDiv').empty();
        $('#loading').empty();
        $("#div-controls").show();
        //$("#fileupload-container-back").show();
        $("#container-camera > div > div:first-child").attr('class', 'col-xs-12 col-sm-6 col-lg-6');
        $("#fileupload-container-id").fileupload("clear");
    });

    //Clears controls and opens File Dialog after choosing an input image
    $("#image-thumbnail-selfie").click(function () {
        $("#input-image-selfie").click();

        $('#facialMatchResponse').hide();
        $('#extractedData').hide();
        $('#faceImage').hide();
        $('#selfie').hide();
        $('#signImage').hide();

        $('#drivers-license-data').empty();
        $('#facial-match-response').empty();
        $('#errorDiv').empty();
        $('#loading').empty();
        $("#div-controls").show();
        $("#fileupload-container-selfie").fileupload("clear");
    });

    var unmodifiedId;
    var preprocessedId;

    //Resize image
    $('#input-image-id').change(function (e) {
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
            cardType: "DriversLicense",
            maxW: maxWidth,
            maxH: maxHeight,
            callback: function (data, width, height) {
                preprocessedId = utilities.DataUrlToBlob(data);
            }
        });

        canvasResize(file, {
            isPreprocessing: false,
            isiOS: isMobile.iOS(),
            cardType: "DriversLicense",
            maxW: maxWidth,
            maxH: maxHeight,
            callback: function (data, width, height) {
                unmodifiedId = utilities.DataUrlToBlob(data);
            }
        });
    });

    var unmodifiedSelfie;
    //Resize image
    $('#input-image-selfie').change(function (e) {
        var file = e.target.files[0];

        var reader = new FileReader();
        reader.onload = function () {

            $("#selfie-image").attr("src", reader.result);
        };
        reader.readAsDataURL(file);
        canvasResize(file, {
            isPreprocessing: false,
            isiOS: isMobile.iOS(),
            cardType: "",
            callback: function (data, width, height) {
                unmodifiedSelfie = utilities.DataUrlToBlob(data);
            }
        });
    });


    $("#btn-process-facial-match").click(function () {

        ResetControls();

        var idFaceImage = null;

        var usePreprocessing = $('#chkPreProcessing').is(':checked') ? true : false;
        var imageSource = $("#imageSource-select").val();

        var selectedRegion = $("#region-select").val();
        var imageToProcess;

        var imgIdVal = $('#input-image-id').val();
        var imgSelfie = $('#input-image-selfie').val();

        $('#diplay-div').empty();
        $('#div-img').empty();
        $('#errorDiv').empty();
        $('#loading').empty();

        if (imgIdVal == '') {
            alert("Capture ID required.");
            return;
        }

        if (imgSelfie == '') {
            alert("Selfie required.");
            return;
        }

        if (usePreprocessing)
            imageToProcess = preprocessedId;
        else
            imageToProcess = unmodifiedId;


        //Accesing the web service 
        var promise = acuantWebservice.ProcessDriversLicense(imageToProcess, selectedRegion, imageSource, usePreprocessing);

        $.when(promise).then(function (driversLicenseResult) {

            //Convert data to string before parsing
            var driversLicense = JSON.stringify(driversLicenseResult);
            driversLicense = jQuery.parseJSON(driversLicense);

            //Checking if there are errors returned.
            if (driversLicense.ResponseCodeAuthorization < 0) {
                ui.RemoveLoadingIcon();
                ui.ShowErrorDescription(driversLicense.ResponseMessageAuthorization);
                return;
            }
            else if (driversLicense.ResponseCodeAutoDetectState < 0) {
                ui.RemoveLoadingIcon();
                ui.ShowErrorDescription(driversLicense.ResponseCodeAutoDetectStateDesc);
                return;
            }
            else if (driversLicense.ResponseCodeProcState < 0) {
                ui.RemoveLoadingIcon();
                ui.ShowErrorDescription(driversLicense.ResponseCodeProcessStateDesc);
                return;
            }
            else if (driversLicense.WebResponseCode < 1) {
                ui.RemoveLoadingIcon();
                ui.ShowErrorDescription(driversLicense.WebResponseDescription);
                return;
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

                //Display face, sign and reformatted images on UI
                var faceImage = driversLicense.FaceImage;
                if (faceImage != null || faceImage != "") {
                    var base64FaceImage = goog.crypt.base64.encodeByteArray(faceImage);

                    //Store face image into variable for FacialMatch API
                    idFaceImage = utilities.DataUrlToBlob("data:image/jpg;base64," + base64FaceImage);

                    $("#face-image").attr("src", "data:image/jpg;base64," + base64FaceImage);
                }
                else {
                    ui.ShowErrorDescription("Face image was not found.");
                    return;
                }

                var signImage = driversLicense.SignImage;
                if (signImage != null || signImage != "") {
                    var base64SignImage = goog.crypt.base64.encodeByteArray(signImage);

                    $("#signature-image").attr("src", "data:image/jpg;base64," + base64SignImage);
                }

                var reformattedImage = driversLicense.ReformattedImage;
                if (reformattedImage != null || reformattedImage != "") {
                    var base64ReformattedImage = goog.crypt.base64.encodeByteArray(reformattedImage);
                    $("#image-thumbnail-id img:first-child").attr("src", "data:image/jpg;base64," + base64ReformattedImage);
                }
            }

            facialMatchData = new FormData();
            facialMatchData.append("idFaceImage", idFaceImage);
            facialMatchData.append("selfieImage", unmodifiedSelfie);

            promise = acuantWebservice.FacialMatch(facialMatchData);

            promise.error(function (response) {

                var error = jQuery.parseJSON(JSON.stringify(response));
                $('#errorDiv').html("Error: " + JSON.stringify(error.status + " " + error.statusText));
            });

            promise.done(function (facialMatchResponse) {

                //Convert data to string before parsing
                var response = JSON.stringify(facialMatchResponse);
                response = jQuery.parseJSON(response);

                //Checking if there are errors returned.    
                if (response.ResponseCodeAuthorization < 0) {
                    ui.ShowErrorDescription(response.ResponseMessageAuthorization);
                }
                else if (response.WebResponseCode < 1) {
                    ui.ShowErrorDescription(response.WebResponseDescription);
                }
                else {

                    //Display data returned by the web service
                    var data = ui.DisplayField("Facial Match", response.FacialMatch.toString());
                    data += ui.DisplayField("Facial Match Confidence Rating", response.FacialMatchConfidenceRating.toString());

                    $(data).appendTo("#facial-match-response");

                    document.getElementById("facialMatchResponse").style.display = "inline";
                    document.getElementById("extractedData").style.display = "inline";
                    document.getElementById("faceImage").style.display = "inline";
                    document.getElementById("selfie").style.display = "inline";
                    document.getElementById("signImage").style.display = "inline";
                }
            });

            promise.always(function () {
                ui.RemoveLoadingIcon();
                $("#div-controls").hide();
            });
        });   
    });

});
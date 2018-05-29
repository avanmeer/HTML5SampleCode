// JavaScript source code
$(document).ready(function () {

    acuantWebservice = {
        GetLicenseDetails: function () {
            return $.ajax({
                type: "GET",
                url: "https://cssnwebservices.com/CSSNService/CardProcessor/GetLicenseDetails",            
                cache: false,
                contentType: 'application/octet-stream; charset=utf-8;',
                dataType: "json",
                processData: false,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("Authorization", "LicenseKey " + authinfo);
                },
            });
        },

        ProcessDriversLicense: function (imageToProcess, selectedRegion, imageSource, usePreprocessing) {
            return $.ajax({
                type: "POST",
                url: "https://cssnwebservices.com/CSSNService/CardProcessor/ProcessDriversLicense/" + selectedRegion + "/true/-1/true/true/true/0/150/" + usePreprocessing.toString() + "/" + imageSource.toString() +
                "/true/false",

                data: imageToProcess,
                cache: false,
                contentType: 'application/octet-stream; charset=utf-8;',
                dataType: "json",
                processData: false,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("Authorization", "LicenseKey " + authinfo);
                    ui.ShowLoadingIcon();
                    ui.HideControl("#div-controls");
                },
            });
        },

        ProcessPassport: function (imageToProcess, imageSource, usePreprocessing) {

            return $.ajax({
                type: "POST",
                url: "https://cssnwebservices.com/CSSNService/CardProcessor/ProcessPassport/true/true/true/0/150/" + usePreprocessing.toString() + "/" + imageSource.toString() + "/true/false",
                data: imageToProcess,
                cache: false,
                contentType: 'application/octet-stream; charset=utf-8;',
                dataType: "json",
                processData: false,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("Authorization", "LicenseKey " + authinfo);
                    ui.ShowLoadingIcon();
                    ui.HideControl("#div-controls");
                }
            });
        },

        ProcessDLDuplex: function (imageToProcess, selectedRegion, imageSource, usePreprocessing) {

            return $.ajax({
                type: "POST",
                url: "https://cssnwebservices.com/CSSNService/CardProcessor/ProcessDLDuplex/" + selectedRegion + "/true/-1/true/true/true/0/150/" + imageSource.toString() + "/" + usePreprocessing.toString() + "/true/false",
                data: imageToProcess,
                cache: false,
                contentType: 'application/octet-stream; charset=utf-8;',
                dataType: "json",
                processData: false,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("Authorization", "LicenseKey " + authinfo);
                    ui.ShowLoadingIcon();
                    ui.HideControl("#div-controls");
                },
            });
        },

        ProcessMedInsuranceCard: function (imageToProcess, imageSource, usePreprocessing) {
            return $.ajax({
                type: "POST",
                url: "https://cssnwebservices.com/CSSNService/CardProcessor/ProcessMedInsuranceCard/true/0/150/" + usePreprocessing.toString() + "/false/" + imageSource.toString(),

                data: imageToProcess,
                cache: false,
                contentType: 'application/octet-stream; charset=utf-8;',
                dataType: "json",
                processData: false,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("Authorization", "LicenseKey " + authinfo);
                    ui.ShowLoadingIcon();
                    ui.HideControl("#div-controls");
                }
            });
        },

        ProcessBarcode: function (imageToProcess, usePreprocessing) {
            return $.ajax({
                type: "POST",
                url: "https://cssnwebservices.com/CSSNService/CardProcessor/ProcessBarcode/true/0/200/" + usePreprocessing.toString(),
                data: imageToProcess,
                cache: false,
                contentType: 'application/octet-stream; charset=utf-8;',
                dataType: "json",
                processData: false,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("Authorization", "LicenseKey " + authinfo);
                    ui.ShowLoadingIcon();
                    ui.HideControl("#div-controls");
                }
            });
        },

        FacialMatch: function (imageToProcess) {
            return $.ajax({
                type: "POST",
                url: "https://cssnwebservices.com/CSSNService/CardProcessor/FacialMatch",
                data: imageToProcess,
                cache: false,
                contentType: 'application/octet-stream; charset=utf-8;',
                dataType: "json",
                processData: false,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("Authorization", "LicenseKey " + authinfo);
                    ui.ShowLoadingIcon();
                    ui.HideControl("#div-controls");
                }
            });
        }

    };

    utilities = {

        DataUrlToBlob: function (dataUrl) {
            // Decode the dataUrl    
            var binary = atob(dataUrl.split(',')[1]);
            // Create 8-bit unsigned array
            var array = [];
            for (var i = 0; i < binary.length; i++) {
                array.push(binary.charCodeAt(i));
            }
            // Return our Blob object
            return new Blob([new Uint8Array(array)], { type: 'image/jpg' });
        }
    };

    //Detect type of device.
    isMobile = {
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


});
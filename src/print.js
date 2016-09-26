(function (angular, undefined) {
	function NoPrintingService() {

		var oHiddFrame = $("<iframe></iframe>");

		this.getHiddenPrintWindow = function (url) {
			oHiddFrame.css("display", "none");
			$("body").append(oHiddFrame);
			oHiddFrame[0].src = url;

			// oHiddFrame.style.position = "relative";
			// oHiddFrame.style.width = "100%";
			// oHiddFrame.style.height = "100vh";
			//oHiddFrame.src = sURL;

			//document.body.appendChild(oHiddFrame);
			//pollIframe(oHiddFrame, iframeDoc);

			return oHiddFrame;

		};

		this.destroyPrintWindow = function() {
			$("body").remove(oHiddFrame);
		};
	}
	angular.module("noinfopath.helpers")
		.service("noPrinting", [NoPrintingService]);
})(angular);

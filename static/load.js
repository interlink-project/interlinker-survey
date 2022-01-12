
window.addEventListener('load', function () {
    var s = document.createElement("script");
    s.type = "text/javascript";
    s.setAttribute("crossorigin", "anonymous");
    s.setAttribute("referrerpolicy", "no-referrer");
    s.setAttribute("src", "https://cdnjs.cloudflare.com/ajax/libs/tingle/0.8.4/tingle.min.js");
    s.setAttribute("integrity", "sha512-SxopZNPB/jzFpgtGdR6lI7dK8EbbheOZVLNDI0FsMNM0NAqNkJyVoT83C72esOJCTdPVfDb8miZ3whsW4o/+fA==");
    document.body.append(s);

    s.addEventListener('load', function () {
        var cssNode = document.createElement("link");
        cssNode.setAttribute("rel", "stylesheet");
        cssNode.setAttribute("type", "text/css");
        cssNode.setAttribute("href", "https://cdnjs.cloudflare.com/ajax/libs/tingle/0.8.4/tingle.min.css");
        cssNode.setAttribute("integrity", "sha512-j5NOES5oZiza0awDPWoDCbU50obvmJUQobyAqYzhsXFxaXaxkcxB2WhnRcZa5wRGNyborruWuJaeg9J508HfQg==");
        cssNode.setAttribute("referrerpolicy", "no-referrer");
        cssNode.setAttribute("crossorigin", "anonymous");
        document.getElementsByTagName("head")[0].appendChild(cssNode);

        // instanciate new modal
        var modal = new tingle.modal({
            footer: true,
            stickyFooter: false,
            closeMethods: ['overlay', 'button', 'escape'],
            closeLabel: "Close",
            cssClass: ['custom-class-1', 'custom-class-2'],
            onOpen: function () {
                console.log('modal open');
            },
            onClose: function () {
                console.log('modal closed');
            },
            beforeClose: function () {
                // here's goes some logic
                // e.g. save content before closing the modal
                return true; // close the modal
                return false; // nothing happens
            }
        });

        // set content
        modal.setContent('<iframe src="http://localhost:8921/api/v1/surveys/7328a8ae75244b72838b2cbdd40de7bb/gui" frameborder="0" style="overflow:hidden;overflow-x:hidden;overflow-y:hidden;height:100%;width:100%;position:absolute;top:0px;left:0px;right:0px;bottom:0px" height="100%" width="100%"></iframe>');

        // add a button
        modal.addFooterBtn('Button label', 'tingle-btn tingle-btn--primary', function () {
            // here goes some logic
            modal.close();
        });

        // add another button
        modal.addFooterBtn('Dangerous action !', 'tingle-btn tingle-btn--danger', function () {
            // here goes some logic
            modal.close();
        });

        // open modal
        modal.open();
    })
})
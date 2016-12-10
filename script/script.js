var SPA = (function () {

    var activ;
    var documentsData;
    var fragments;
    var Document = {
        name: false,
        fragments: []
    };

    var initDocument = function () {
        createPopup1();
        createPopup2();
        initMenu();
        getDocumentsList();
    };

    var getDocumentsList = function () {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'http://localhost:3000/docs.svc/getDocumentsList', true);
        xhr.send();
        xhr.onreadystatechange = function () {
            if (this.readyState != 4) return;
            if (this.status != 200) {
                alert('Ошибка ' + xhr.status + ': ' + xhr.statusText);
                return;
            }
            documentsData = JSON.parse(xhr.responseText);
            var nav = document.getElementById("nav");
            for(var i in documentsData) {
                var currentDocument = documentsData[i];
                var d2 = document.createElement("div");
                d2.className="document";
                d2.innerText = currentDocument.name;
                d2.setAttribute("id",i);
                d2.onclick = listFragments;
                nav.appendChild(d2);
            }
        };
    };

    function listFragments(event) {
        var d1 = event.target;
        var id = d1.getAttribute("id");
        var currentDocument = documentsData[id];
        if (d1.childNodes.length > 1) {
            while (d1.childNodes.length > 1) {
                d1.removeChild(d1.lastChild);
            }
            removeBody();
        } else {
            if(activ!=undefined){
                while (activ.childNodes.length > 1) {
                    activ.removeChild(activ.lastChild);
                }
            }
            activ = d1;
            fragments = currentDocument.fragments;
            for (var i in fragments) {
                var currentParagraph = fragments[i];
                var d = document.createElement("div");
                d.className = "fragNav";
                d.innerText = currentParagraph.name;
                d.setAttribute("id",i);
                d.onclick = activParagraph;
                d1.appendChild(d);
            }
            bodyDocument(currentDocument);
        }

    }

    function activParagraph(event) {
        event.stopPropagation();
        var el = event.target;
        var id = el.getAttribute("id");
        var currentParagraph = fragments[id];
        var idPared = activ.getAttribute("id");
        var currentDocument = documentsData[idPared];
        var q = document.getElementsByClassName("paragraph");
        if(q[currentParagraph.id].getAttribute("activ")=="0") {
            getParagraph(currentDocument.id, currentParagraph.id, q[currentParagraph.id]);
        }
        else{
            q[currentParagraph.id].setAttribute("activ","0");
            q[currentParagraph.id].innerText = "Paragraph: "+currentParagraph.name+"\n\n";
        }
    }

    var bodyDocument = function () {
        removeBody();
        var b = document.getElementById("bodyDocument");
        for(var i in fragments) {
            var frag = fragments[i];
            var b2 = document.createElement("div");
            b2.className="paragraph";
            b2.innerText = "Paragraph: "+frag.name+"\n\n";
            b2.setAttribute("activ","0");
            b2.setAttribute("id",i);
            b2.onclick = activParagraph;
            b.appendChild(b2);
        }
    };

    var getParagraph = function (idDoc,idFrag,div) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'http://localhost:3000/docs.svc/getDocumentFragment?docId='+idDoc+'&fragmentId='+idFrag, true);
        xhr.send();
        xhr.onreadystatechange = function () {
            if (this.readyState != 4) return;
            if (this.status != 200) {
                alert('Ошибка ' + xhr.status + ': ' + xhr.statusText);
                return;
            }
            div.setAttribute("activ","1");
           div.innerText+=JSON.parse(xhr.responseText).content;
        };
    };

    var removeBody = function () {
        var b = document.getElementById("bodyDocument");
        while (b.childNodes.length>1){
            b.removeChild(b.lastChild);
        }
    };

    var createPopup1 = function () {
        var divPopup =document.createElement("div");
        divPopup.setAttribute("id","popup1");
        divPopup.className="popup";
        divPopup.style.visibility="hidden";
        var div = document.createElement("div");
        div.className = "popup-content";
        var input = document.createElement("input");
        input.setAttribute("type","text");
        input.setAttribute("id","nameNewDoc");
        var button1 = document.createElement("button");
        button1.setAttribute("type","submit");
        button1.setAttribute("id","createDoc");
        button1.innerText= "Create Document";
        var button2 = document.createElement("button");
        button2.setAttribute("type","submit");
        button2.setAttribute("id","back");
        button2.innerText="Back";
        div.innerText = "Document name:";
        div.appendChild(input);
        div.appendChild(button1);
        div.appendChild(button2);
        divPopup.appendChild(div);
        document.body.appendChild(divPopup);
    };

    var createPopup2 = function () {
        var divPopup =document.createElement("div");
        divPopup.setAttribute("id","popup2");
        divPopup.className="popup";
        divPopup.style.visibility="hidden";
        divPopup.innerHTML = "<div class='popup-content'>Paragraph name: <input type='text' id='nameParagraph'>Content:<input type='text' id='context'> <button type='submit' id='createParagraph'>Create Paragraph</button> <button type='submit' id='backParagraph'>Back</button> </div>";
        document.body.appendChild(divPopup);
    };

    var initMenu = function () {
        document.getElementById("new_document").onclick = newDocClick;
        document.getElementById("new_paragraph").onclick = newParagraphClick;
        document.getElementById("save").onclick = save;
    };

    function newDocClick() {
        document.getElementById("popup1").style.visibility = "visible";
        document.getElementById("createDoc").onclick = createDoc;
        document.getElementById("back").onclick = function () {
            document.getElementById("popup1").style.visibility = "hidden";
        };
    }

    function createDoc() {
        Document.name = document.getElementById("nameNewDoc").value;
        var nav = document.getElementById("nav");
        var newDoc = document.createElement("div");
        newDoc.className="document";
        newDoc.innerText = document.getElementById("nameNewDoc").value;
        removeBody();
        if(activ!=undefined){
            while (activ.childNodes.length > 1) {
                activ.removeChild(activ.lastChild);
            }
        }
        activ = newDoc;
        nav.appendChild(newDoc);
        document.getElementById("new_paragraph").style.opacity="1";
        document.getElementById("save").style.opacity="1";
        document.getElementById("popup1").style.visibility = "hidden";
    }

    function newParagraphClick() {
        if(Document.name){
            document.getElementById("popup2").style.visibility = "visible";
            document.getElementById("createParagraph").onclick = createParagraph;
            document.getElementById("backParagraph").onclick = function () {
                document.getElementById("popup2").style.visibility = "hidden";
            };
        }else{
            alert("Сначало нужно создать документ!!!");
        }
    }

    function createParagraph() {
        var name = document.getElementById("nameParagraph").value;
        var content = document.getElementById("context").value;
        Document.fragments.push({
            name: name,
            content: content
        });
        var b = document.getElementById("bodyDocument");
        var b2 = document.createElement("div");
        b2.className = "paragraph";
        b2.innerText = "Paragraph: "+name+"\n\n"+content;
        b.appendChild(b2);
        document.getElementById("popup2").style.visibility = "hidden";
    }

    function save() {
        if(Document.name){
            var xhr = new XMLHttpRequest();
            var params = 'document=' + JSON.stringify(Document);
            xhr.open('POST', 'http://localhost:3000/docs.svc/saveDocument', true);
            xhr.send(params);
            xhr.onreadystatechange = function () {
                if (this.readyState != 4) return;
                if (this.status != 200) {
                    alert('Ошибка ' + xhr.status + ': ' + xhr.statusText);
                    return;
                }
                alert('Документ сохранён');
            }
        }else{
            alert("Сначало нужно создать документ!!!");
        }
    }

    return{
        initDocument : initDocument
    }
})();

 window.onload = SPA.initDocument;

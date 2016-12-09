var SPA = (function () {

    let activ;

    var initDocument = function () {
        createPopup1();
        createPopup2();
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'http://localhost:3000/docs.svc/getDocumentsList', true);
        xhr.send();
        xhr.onreadystatechange = function () {
            if (this.readyState != 4) return;
            if (this.status != 200) {
                alert('Ошибка ' + xhr.status + ': ' + xhr.statusText);
                return;
            }
            var documentsData = JSON.parse(xhr.responseText);
            var nav = document.getElementById("nav");
            for(i in documentsData) {
                var currentDocument = documentsData[i];
                var d2 = document.createElement("div");
                d2.className="document";
                d2.innerText = currentDocument.name;
                listFragments(currentDocument,d2);
                nav.appendChild(d2);
            }
        };
        initMenu();
    };

    var listFragments = function (currentDocument,d2) {
        let d1 = d2;
        d1.onclick = function (event) {
            var target = event.target;
            if (target.className == 'document') {
                if (d1.childNodes.length > 1) {
                    while (d1.childNodes.length > 1) {
                        d1.removeChild(d1.lastChild);
                    }
                    removeBody();
                } else {
                    bodyDocument(currentDocument);
                    if(activ!=undefined){
                    while (activ.childNodes.length > 1) {
                        activ.removeChild(activ.lastChild);
                    }
                    }
                    activ = d1;
                    for (let i in currentDocument.fragments) {
                        let currentParagraph = currentDocument.fragments[i];
                        let d = document.createElement("div");
                        d.className = "fragNav";
                        d.innerText = currentParagraph.name;
                        d.onclick = function (event) {
                            var target = event.target;
                            if (target.className == 'fragNav') {
                                let q = document.getElementsByClassName("paragraph");
                                if(q[currentParagraph.id].getAttribute("activ")=="0") {
                                    getParagraph(currentDocument.id, currentParagraph.id, q[currentParagraph.id]);
                                }
                                else{
                                    q[currentParagraph.id].setAttribute("activ","0");
                                    q[currentParagraph.id].innerText = "Paragraph: "+currentParagraph.name+"\n\n";
                                }
                            }
                        };
                        d1.appendChild(d);
                    }
                }
            }
        }
    };

    var bodyDocument = function (currentDocument) {
        let doc = currentDocument;
        removeBody();
        let b = document.getElementById("bodyDocument");
        for(i in currentDocument.fragments) {
            let frag = currentDocument.fragments[i];
            let b2 = document.createElement("div");
            b2.className="paragraph";
            b2.innerText = "Paragraph: "+frag.name+"\n\n";
            b2.setAttribute("activ","0");
            b2.setAttribute("id",i);
            b2.onclick = function (event) {
                var target = event.target;
                if (target.tagName != 'div'){
                    if(b2.getAttribute("activ")=="0") {
                        getParagraph(doc.id, frag.id, b2);
                    }
                    else{
                        b2.setAttribute("activ","0");
                        b2.innerText = "Paragraph: "+frag.name+"\n\n";
                    }
                }
            };
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
        document.getElementById("new_document").onclick = function () {
            document.getElementById("popup1").style.visibility = "visible";
            document.getElementById("createDoc").onclick = function () {
                Document.name = document.getElementById("nameNewDoc").value;
                var nav = document.getElementById("nav");
                var newDoc = document.createElement("div");
                newDoc.className="document";
                newDoc.innerText = document.getElementById("nameNewDoc").value;
                nav.appendChild(newDoc);
                document.getElementById("new_paragraph").style.opacity="1";
                document.getElementById("save").style.opacity="1";
                document.getElementById("popup1").style.visibility = "hidden";
            };
            document.getElementById("back").onclick = function () {
                document.getElementById("popup1").style.visibility = "hidden";
            };
        };

        document.getElementById("new_paragraph").onclick = function () {
            if(Document.name){
                document.getElementById("popup2").style.visibility = "visible";
                document.getElementById("createParagraph").onclick = function () {
                    var name = document.getElementById("nameParagraph").value;
                    var content = document.getElementById("context").value;
                    Document.fragments.push({
                        name: name,
                        content: content
                    });
                    let b = document.getElementById("bodyDocument");
                    let b2 = document.createElement("div");
                    b2.className = "paragraph";
                    b2.innerText = "Paragraph: "+name+"\n\n"+content;
                    b.appendChild(b2);
                    document.getElementById("popup2").style.visibility = "hidden";
                };
                document.getElementById("backParagraph").onclick = function () {
                    document.getElementById("popup2").style.visibility = "hidden";
                };
            }else{
                alert("Сначало нужно создать документ!!!");
            }
        };

        document.getElementById("save").onclick = function () {
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
        };

    };

    var Document = {
        name: false,
        fragments: []
    };

    return{
        initDocument : initDocument
    }

})();

 window.onload = SPA.initDocument;

import { train, predict, save, load, trainClassification, predictClassification } from "./model.js";
import schema from "./model.js";

const btnName = document.querySelector("#btnName");
btnName.onclick = async (event) => {
    event.preventDefault();
    const inpModel = document.querySelector("#ModelName");
    localStorage.setItem("ModelName", inpModel.value);
    const input = JSON.parse(localStorage.getItem("schema")); //1 get schema from above
    console.log(input);
    const h4 = document.createElement("h4");
    h4.innerHTML = "Customize your Model";
    document.getElementById("Hinfo").appendChild(h4);

    let output = document.createElement("select");
    output.setAttribute("id", "select");
    let outInd = document.createElement("h4");
    outInd.innerHTML = "Choose an Output";
    document.getElementById("output").appendChild(outInd);
    document.getElementById("output").appendChild(output);

    Object.keys(input).forEach((e) => {
        let label = document.createElement("label");
        label.setAttribute("class", "form-check-label");
        label.innerHTML = e;
        document.getElementById("listCols").appendChild(label);
        let check = document.createElement("input");

        check.setAttribute("type", "checkbox");
        check.setAttribute("class", "form-check-input list");
        check.setAttribute("value", e);
        check.innerHTML = e;
        document.getElementById("listCols").appendChild(check);
        document
            .getElementById("listCols")
            .appendChild(document.createElement("br"));

        let option = document.createElement("option");
        option.setAttribute("value", e);

        option.innerHTML = e;

        document.getElementById("select").appendChild(option);
    });
    document.getElementById("output").appendChild(document.createElement("br"));

    const btTrain = document.createElement("button");

    btTrain.innerHTML = "Train";
    btTrain.setAttribute("class", "btn btn-outline-success");
    btTrain.setAttribute("id", "id-train");
    document.getElementById("output").appendChild(btTrain);
    let data = [];
    document.getElementById("id-train").addEventListener("click", async () => {
        document.querySelectorAll(".list").forEach((e) => {
            e.checked && data.push(e.value);
        });
        localStorage.setItem(
            "choice",
            JSON.stringify({
                features: data,
                output: document.getElementById("select").value,
            })
        );
        if (schema[document.getElementById("select").value].type !== "string") {
            await train({ features: data, output: document.getElementById("select").value }).then(async result => {

                let inpData = document.getElementById("newData")
                let ul = document.createElement("ul")
                data.forEach(e => {
                    let li = document.createElement("li")
                    let inp = document.createElement("input")
                    inp.setAttribute("class", "inp")
                    if (input[e].type === "string") {
                        inp.setAttribute("type", "text")
                    }
                    else {
                        inp.setAttribute("type", "number")
                    }
                    inp.setAttribute("placeholder", e)
                    inp.setAttribute("name", e)
                    li.appendChild(inp)
                    ul.appendChild(li)
                })
                inpData.appendChild(ul)
                console.log(result)
                const predictB = document.createElement("button")
                predictB.setAttribute("class", "btn btn-outline-success")
                predictB.setAttribute("id", "predict")
                predictB.setAttribute("style", "margin-left: 50px;")
                predictB.innerHTML = "Predict"
                document.getElementById("newData").appendChild(predictB)


                document.getElementById("predict").addEventListener("click", async () => {
                    const inp = document.getElementsByClassName("inp")
                    const entredData = {}
                    inp.forEach(e => {
                        entredData[e.name] = e.value;
                    })
                    let res = document.createElement("h6")
                    res.setAttribute("style", "color:blue;")
                    res.setAttribute("id", "PreRes")
                    res.innerHTML = `Prediction: ${predict(entredData)}`
                    console.log(predict(entredData))
                    document.getElementById("newData").appendChild(document.createElement("br"))
                    document.getElementById("newData").appendChild(document.createElement("br"))
                    document.getElementById("newData").appendChild(res)
                })



            })
        }
        else {
            await trainClassification({ features: data, output: document.getElementById("select").value }).then(async result => {

                let inpData = document.getElementById("newData")
                let ul = document.createElement("ul")
                data.forEach(e => {
                    let li = document.createElement("li")
                    let inp = document.createElement("input")
                    inp.setAttribute("class", "inp")
                    if (input[e].type === "string") {
                        inp.setAttribute("type", "text")
                    }
                    else {
                        inp.setAttribute("type", "number")
                    }
                    inp.setAttribute("placeholder", e)
                    inp.setAttribute("name", e)
                    li.appendChild(inp)
                    ul.appendChild(li)
                })
                inpData.appendChild(ul)
                console.log(result)
                const predictB = document.createElement("button")
                predictB.setAttribute("class", "btn btn-outline-success")
                predictB.setAttribute("id", "predict")
                predictB.setAttribute("style", "margin-left: 50px;")
                predictB.innerHTML = "Predict"
                document.getElementById("newData").appendChild(predictB)


                document.getElementById("predict").addEventListener("click", async () => {
                    const inp = document.getElementsByClassName("inp")
                    const entredData = {}
                    inp.forEach(e => {
                        entredData[e.name] = e.value;
                    })
                    let res = document.createElement("h6")
                    res.setAttribute("style", "color:blue;")
                    res.setAttribute("id", "PreRes")
                    document.getElementById("newData").appendChild(document.createElement("br"))
                    document.getElementById("newData").appendChild(document.createElement("br"))
                    let ClassPridection = predictClassification(entredData, document.getElementById("select").value)
                    let text = ""
                    Object.keys(ClassPridection).forEach((e) => {

                        if (e != "0") {
                            text = text + `Prediction: ${ClassPridection[e]} about ${e}% - - -`
                        }

                    })
                    res.innerHTML = text
                    document.getElementById("newData").appendChild(res)
                    document.getElementById("newData").appendChild(document.createElement("br"))



                })



            })
        }
    });
};


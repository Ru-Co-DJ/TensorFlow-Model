import DATA from "./shuffled_D.json" assert { type: "json" };

Array.prototype.different = function (col) { //different donnera le nombre des différentes possibilitéspour la colonne
  return this.reduce((acc, cur) => {
    return cur[col] && cur[col] !== null && !acc.includes(cur[col]) ? acc.concat(cur[col]) : acc
  }, [])
}
Array.prototype.maxim = function (col) {
  return this.reduce((acc, cur) => {
    return acc < cur[col] && cur[col] !== null ? cur[col] : acc
  }, this[0][col])
}

let cols = []
let schema = {}
Object.keys(DATA[0]).forEach(k => {
  cols.push(k)
})
cols.forEach(k => {
  let colProp = {}
  colProp["type"] = typeof DATA[0][k]
  colProp["label"] = k
  colProp["possibleValues"] = DATA.different(k)
  if (typeof DATA[0][k] == "number") { colProp["maxIfInt"] = DATA.maxim(k) }
  schema[k] = colProp
})
localStorage.setItem("schema", JSON.stringify(schema))

const model = tf.sequential();
let lengthOfCodedData = 0



const oneHot = (feature, featureValue) => {
  let coded = []
  Object.keys(schema).forEach(c => {
    if (c === feature) {
      coded = Array.from(tf
        .oneHot(schema[c].possibleValues.indexOf(featureValue), schema[c].possibleValues.length)
        .dataSync())
    }
  })
  return coded
}


const train = async (choice) => {
  function getData(choice) {
    let xs = []
    let ys = []
    DATA.forEach(e => {
      let x = []
      choice.features.forEach(f => {
        if (typeof e[f] == "string") {
          x.push(oneHot(f, e[f]))
        }
        else {
          x.push(e[f])
        }
      })
      xs.push(x.flat())
      ys.push(e[choice.output])
    })

    return { xs, ys };
  }
  const { xs, ys } = getData(choice)

  let lengthOfInput = xs[0].length
  lengthOfCodedData = lengthOfInput
  model.add(tf.layers.dense({ inputShape: [lengthOfInput], units: 1, activation: "relu" }));
  // model.add(tf.layers.dense({ inputShape: [4], units: 3, activation: "relu" }));
  // model.add(tf.layers.dense({ inputShape: [3], units: 2, activation: "relu" }));
  // model.add(tf.layers.dense({ inputShape: [2], units: 1, activation: "relu" }));

  model.summary();

  model.compile({
    loss: tf.losses.absoluteDifference,
    shuffle: true,
    optimizer: tf.train.adam(0.06),
    metrics: ["accuracy"],
  });
  const features = tf.tensor(xs, [xs.length, xs[0].length]);
  const labels = tf.tensor(ys, [ys.length, 1]);
  const metrics = ['loss', 'val_loss', 'acc', 'val_acc']
  const container = {
    name: 'Model Training',
    styles: {
      height: '1000px'
    }
  };
  const fitCallbacks = tfvis.show.fitCallbacks(container, metrics)

  await model
    .fit(features, labels, {
      epochs: 30,
      batchSize: 512,
      shuffle: true,
      callbacks: fitCallbacks
    })

  return "Trained with success"
};

const trainClassification = async (choice) => {
  function getData(choice) {
    let xs = []
    let ys = []
    DATA.forEach(e => {
      let x = []
      choice.features.forEach(f => {
        if (typeof e[f] == "string") {
          x.push(oneHot(f, e[f]))
        }
        else {
          x.push(e[f])
        }
      })
      xs.push(x.flat())
      ys.push(oneHot(choice.output, e[choice.output]))
    })

    return { xs, ys };
  }
  const { xs, ys } = getData(choice)
  let lengthOfInput = xs[0].length
  lengthOfCodedData = lengthOfInput
  model.add(tf.layers.dense({ inputShape: [lengthOfInput], units: 4, activation: "relu" }));
  model.add(tf.layers.dense({ units: ys[0].length, activation: "softmax" }));


  model.compile({
    loss: "categoricalCrossentropy",
    optimizer: tf.train.adam(0.1),
    metrics: ["accuracy"]
  });

  model.summary();

  const features = tf.tensor(xs);
  const labels = tf.tensor(ys);

  const metrics = ['loss', 'val_loss', 'acc', 'val_acc']
  const container = {
    name: 'Model Training',
    styles: {
      height: '1000px'
    }
  };
  const fitCallbacks = tfvis.show.fitCallbacks(container, metrics)

  await model
    .fit(features, labels, {
      epochs: 10,
      batchSize: Math.floor(DATA.length / 12),
      shuffle: true,
      callbacks: fitCallbacks
    })


  let codeForOut = []
  schema[choice.output].possibleValues.forEach(e => {
    codeForOut.push(oneHot(choice.output, e))
  })
  schema[choice.output]["CodedValues"] = codeForOut

  return "Successfuly trained"
}

const predictClassification = (inputs, out) => {
  let codedInpValues = []
  Object.keys(inputs).forEach(e => {
    if (isNaN(inputs[e])) {
      codedInpValues.push(oneHot(e, inputs[e]))
    }
    else {
      codedInpValues.push(Number(inputs[e]))
    }
  })

  let result = model.predict(tf.tensor(codedInpValues.flat(), [1, lengthOfCodedData])).arraySync().flat()

  let ResObj = {}
  result.forEach((_e, i, arr) => {
    let maxi = arr.indexOf(Math.max(...arr))
    let res = Array(arr.length).fill(0)
    res[maxi] = 1

    ResObj[`${Math.floor(arr[maxi] * 100)}`] = schema[out].possibleValues[schema[out].CodedValues.indexOf(schema[out].CodedValues.find(e => { return JSON.stringify(e) === JSON.stringify(res) }))]

    arr[maxi] = 0
  })
  return ResObj

}

const save = async (Mname) => {
  await model.save(`localstorage://${Mname}`).then(() => {
    return "Saved successfully"
  })
}

const predict = (inputs) => {
  let codedInpValues = []
  Object.keys(inputs).forEach(e => {
    if (isNaN(inputs[e])) {
      codedInpValues.push(oneHot(e, inputs[e]))
    }
    else {
      codedInpValues.push(Number(inputs[e]))
    }
  })

  return (
    model.predict(tf.tensor(codedInpValues.flat(), [1, lengthOfCodedData])).arraySync()
  );

}


const load = async (Mname) => {
  const model = await tf.loadLayersModel(`localstorage://${Mname}`);
  return model
}

export { predict, load, save, train, trainClassification, predictClassification }
export default schema



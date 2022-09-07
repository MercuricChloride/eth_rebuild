import { atom, atomFamily, selectorFamily } from "recoil";
import * as Displays from "../../Nodes/Displays";
import * as Pipes from "../../Nodes/Pipes";
import * as Inputs from "../../Nodes/Inputs";
import { Edge, Node } from "react-flow-renderer";

export const nodeTypesState = atom({
  key: "nodeTypes",
  default: {
    // inputs
    numberInputNode: Inputs.NumberInputNode,
    stringInputNode: Inputs.StringInputNode,
    buttonInputNode: Inputs.ButtonInputNode,

    // pipes
    doubleNumNode: Pipes.DoubleNumNode,
    stringConcatNode: Pipes.StringConcatNode,
    dynamicNode: Pipes.DynamicNode,
    hashNode: Pipes.HashNode,

    // displays
    numberDisplayNode: Displays.NumberDisplayNode,
    stringDisplayNode: Displays.StringDisplayNode,
    multiDisplayNode: Displays.MultiDisplayNode,
    arrayDisplayNode: Displays.ArrayDisplayNode,
  },
});

// function prettyNames() {
//   const pattern = /[A-Z]/g;
//   let displays = Object.keys(Displays).map((name) =>
//     name.replace(pattern, " $&")
//   );
//   let inputs = Object.keys(Inputs).map((name) => name.replace(pattern, " $&"));
//   let pipes = Object.keys(Pipes).map((name) => name.replace(pattern, " $&"));
//   return [...displays, ...inputs, ...pipes];
// }
// export const nodeTypesPrettyState = atom({
//   key: "nodeTypesPretty",
//   default: {
//     inputs: ["Number Input", "String Input", "Button"],

//     pipes: ["Double Number", "String Concat", "Dynamic Node", "Hash Node"],

//     displays: [
//       "Number Display",
//       "String Display",
//       "Multi Display",
//       "Array Display",
//     ],
//   },
// });

export const nodeTypesPrettyState = atom({
  key: "nodeTypesPretty",
  default: {
    // inputs
    inputs: {
      numberInputNode: "Number Input",
      stringInputNode: "String Input",
      buttonInputNode: "Button",
    },
    pipes: {
      doubleNumNode: "Double Number",
      stringConcatNode: "String Concat",
      dynamicNode: "Dynamic Node",
      hashNode: "Hash Node",
    },
    displays: {
      numberDisplayNode: "Number Display",
      stringDisplayNode: "String Display",
      multiDisplayNode: "Multi Display",
      arrayDisplayNode: "Array Display",
    },
  },
});

export const nodeState = atom<Array<Node>>({
  key: "nodes",
  default: [],
});

export const edgeState = atom<Array<Edge>>({
  key: "edges",
  default: [],
});

export const nodeDataState = atomFamily<object, string>({
  key: "nodeDataState",
  default: selectorFamily({
    key: "nodeDataState/Default",
    get:
      (id) =>
      ({ get }) => {
        const nodes = get(nodeState);
        return nodes.find((n) => n.id === id) || {};
      },
  }),
});

export const cursorPositionState = atom({
  key: "cursorPosition",
  default: { x: 0, y: 0 },
});

export const defaultNodeStyleState = atom({
  key: "defaultNodeStyle",
  default: {
    background: "#D1D5DB",
    color: "#1F2937",
    border: "1px solid #9CA3AF",
    padding: 10,
    borderRadius: 4,
  },
});

export const defaultHandleStyleState = atom({
  key: "defaultHandleStyle",
  default: {
    background: "#D1D5DB",
    border: "1px solid #9CA3AF",
    borderRadius: 4,
    width: 14,
    height: 14,
    top: -7,
    left: -7,
    position: "absolute",
    cursor: "pointer",
  },
});

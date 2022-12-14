import ReactFlow, {
  Controls,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Background,
  useReactFlow,
  NodeChange,
  EdgeChange,
  Connection,
  Edge,
  Node,
} from "reactflow";
import "reactflow/dist/style.css";
import { cursorPositionState, edgeState, maxNodeIdState, nodeState, nodeTypesState } from "./Recoil/Atoms/atoms";
import { useRecoilState, useRecoilValue } from "recoil";
import { useCallback, useEffect, useRef } from "react";
import { Button, Layout } from "antd";
import { MenuHeader } from "./Components/Header";
import { CustomControls } from "./Components/CustomControls";
import { useState } from "react";
import { allNodeDataSelector } from "./Recoil/Selectors/selectors";
import { addBuildToDB, Build, getBuildFromDB } from "./Recoil/firebase";
import { useParams } from "react-router-dom";
import { useAccount, useConnect, useDisconnect, useSignMessage } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { verifyMessage } from "ethers/lib/utils";

const { Content } = Layout;

export function Flow() {
  // @notice general data
  const [nodes, setNodes] = useRecoilState(nodeState);
  const [edges, setEdges] = useRecoilState(edgeState);
  const [nodeData, setNodeData] = useRecoilState(allNodeDataSelector);
  const [_, setCursorPos] = useRecoilState(cursorPositionState);

  // @notice url_params, or generate a random number if it is a new build
  const buildId = useParams().buildId;

  // @notice wagmi hooks
  const { address, isConnected } = useAccount();
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  });
  const { disconnect } = useDisconnect();
  const { data, status, isLoading, signMessage } = useSignMessage({
    onSuccess(data, variables) {
      const address = verifyMessage(variables.message, data);
      localStorage.setItem("userAddress", address);
    },
  });

  // @notice for adding new nodes
  const [maxNodeId, setMaxNodeId] = useRecoilState(maxNodeIdState);
  const nodeTypes = useRecoilValue(nodeTypesState);

  // @notice for the drag and drop handles
  const connectingNodeId = useRef("");
  const connectingNodeHandleId = useRef("");
  const connectingNodeHandleType = useRef("");

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { project } = useReactFlow();

  const userAddress = localStorage.getItem("userAddress");

  const onNodesChange = useCallback((changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)), [setNodes]);
  const onEdgesChange = useCallback((changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)), [setEdges]);

  const onConnect = useCallback(
    (connection: Edge | Connection) => {
      setEdges((eds) => addEdge(connection, eds));
    },
    [setEdges]
  );

  const onConnectStart = useCallback((_, { nodeId, handleId, handleType }) => {
    connectingNodeId.current = nodeId;
    connectingNodeHandleId.current = handleId;
    connectingNodeHandleType.current = handleType;
  }, []);

  const onConnectEnd = useCallback(
    (event: MouseEvent) => {
      if (event.target instanceof Element) {
        const targetIsPane = event.target.classList.contains("react-flow__pane");
        if (targetIsPane) {
          if (reactFlowWrapper.current?.getBoundingClientRect()) {
            // TODO: REMOVE THIS REDUNDANCY (see src/Components/Header.tsx function addNode)
            const { top, left } = reactFlowWrapper.current.getBoundingClientRect();
            const id = String(maxNodeId);
            setMaxNodeId(maxNodeId + 1);
            const newNode = {
              id,
              type: connectingNodeHandleType.current == "source" ? "stringDisplayNode" : "anyInputNode",
              position: project({
                x: event.clientX - left - 75,
                y: event.clientY - top,
              }),
              data: { label: `Node ${id}` },
            };
            setNodes((nds) => nds.concat(newNode));
            setEdges((eds) =>
              eds.concat(
                connectingNodeHandleType.current == "source"
                  ? {
                      id: `${connectingNodeId.current}-${id}`,
                      source: connectingNodeId.current,
                      sourceHandle: connectingNodeHandleId.current,
                      target: id,
                      targetHandle: "a",
                    }
                  : {
                      id: `${id}a-${connectingNodeId.current}${connectingNodeHandleId.current}`,
                      source: id,
                      sourceHandle: "a",
                      target: connectingNodeId.current,
                      targetHandle: connectingNodeHandleId.current,
                    }
              )
            );
          }
        }
      }
    },
    [nodes]
  );

  async function loadBuild() {
    if (buildId) {
      try {
        console.log("loading build");
        const build = JSON.parse(await getBuildFromDB(buildId));
        const { nodes, edges, nodeData } = build;
        setNodes(nodes);
        setEdges(edges);
        setNodeData(nodeData);
      } catch (e) {
        console.log("This is a new build!");
      }
    }
  }

  async function saveBuild() {
    if (buildId) {
      if (userAddress) {
        try {
          const build: Build = {
            id: buildId,
            nodes,
            edges,
            nodeData,
            createdBy: userAddress,
          };
          await addBuildToDB(build);
        } catch (e) {
          console.error(e);
        }
      }
    }
  }
  useEffect(() => {
    if (!buildId) {
      window.location.href = "/build/" + String(Math.floor(Math.random() * 1_000_000_000_000_000_000));
    }
    loadBuild();
  }, []);

  return (
    <Layout
      style={{
        height: "100vh",
        width: "100vw",
      }}
    >
      <MenuHeader />
      <Button
        type="primary"
        onClick={async () => {
          console.log("Uploading to DB");
          try {
            await saveBuild();
            console.log("Done");
          } catch (e) {
            console.error(e);
          }
        }}
      >
        Save
      </Button>
      <Button
        type="primary"
        onClick={async () => {
          navigator.clipboard.writeText(window.location.origin + "/create/" + buildId);
        }}
      >
        Copy URL
      </Button>
      <Content>
        <div
          ref={reactFlowWrapper}
          style={{
            height: "100%",
            width: "100%",
          }}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            onPaneContextMenu={(e) => e.preventDefault()}
            onConnectStart={onConnectStart}
            onConnectEnd={onConnectEnd}
            onMouseMove={(e) => {
              setCursorPos({
                x: e.clientX,
                y: e.clientY,
              });
            }}
          >
            <Background />
            <CustomControls />
          </ReactFlow>
        </div>
      </Content>
    </Layout>
  );
}

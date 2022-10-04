import { useEffect } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { nodeDataState } from "../../../Recoil/Atoms/atoms";
import { connectedValueSelector } from "../../../Recoil/Selectors/selectors";
import { createHandles, getDataSources } from "../../../Helpers/helpers";

export function EncryptNode({ id }) {
  const [state, setState] = useRecoilState(nodeDataState(id));
  const a = useRecoilValue(connectedValueSelector([id, "a"]));
  const b = useRecoilValue(connectedValueSelector([id, "b"]));

  const encrypt = async () => {};

  useEffect(() => {
    if (a && b) {
      encrypt();
    }
  }, [a, b]);

  return (
    <div className="custom-node pipe">
      <h4>Encrypt</h4>
      {createHandles("input", 2, ["shared key", "message"])}
      {createHandles("output", 1)}
    </div>
  );
}

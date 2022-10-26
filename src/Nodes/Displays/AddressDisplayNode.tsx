import { connectedValueSelector } from "../../Recoil/Selectors/selectors";
import { useRecoilValue } from "recoil";
import { Handles } from "../../Helpers/helpers";
import { isAddress } from "ethers/lib/utils";
import makeBlockie from "ethereum-blockies-base64";

export function AddressDisplayNode({ id }) {
  const a = useRecoilValue(connectedValueSelector([id, "a"]));
  const isValid = isAddress(a);

  return (
    <div className="custom-node display">
      <h4>Address Display</h4>{" "}
      <span>
        <Handles
          kind="input"
          count={1}
          id={id}
          types={{
            a: "string",
          }}
          labels={["Address"]}
        />
        {isValid ? <img height={50} width={50} src={makeBlockie(a)} style={{ margin: "10px" }} /> : ""}
        {isValid ? a : "Invalid Address"}
      </span>
    </div>
  );
}

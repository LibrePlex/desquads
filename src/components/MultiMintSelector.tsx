import { PublicKey } from "@solana/web3.js";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";
import { toast } from "react-toastify";

export interface IMultiMintSelectorState {
  inputMints: string;
  errors: { i: string; e: string }[];
  setInputMints: Dispatch<SetStateAction<string>>;
  setErrors: Dispatch<SetStateAction<{ i: string; e: string }[]>>;
  mintIds: PublicKey[];
  setMintIds: Dispatch<SetStateAction<PublicKey[]>>;
}

export const useMultiMintSelectorState = () => {
  const [inputMints, setInputMints] = useState<string>('["GcsiWkck368rhVyXfsCv8pCxFvFEmVjeykcqDGakAJXJ"]');
  const [errors, setErrors] = useState<{ i: string; e: string }[]>([]);
  const [mintIds, setMintIds] = useState<PublicKey[]>([]);

  return { inputMints, setInputMints, errors, setErrors, mintIds, setMintIds };
};

export const MultiMintSelector = (props: IMultiMintSelectorState) => {
  const { inputMints, setInputMints, setErrors, setMintIds, mintIds, errors } =
    props;

  const processInput = useCallback(() => {
    const _errors: { i: string; e: string }[] = [];
    const _mintIds = new Set<string>();
    try {
      const inputJson = JSON.parse(inputMints);
      setInputMints(JSON.stringify(inputJson, undefined, 4));
      for (const i of inputJson) {
        try {
          _mintIds.add(new PublicKey(i).toBase58());
        } catch (e) {
          _errors.push({ i, e: (e as Error).message });
        }
      }
    } catch (e) {
      toast.error(
        "Could not parse hashlist. Please check the format and try again"
      );
    }
    setErrors(_errors);
    setMintIds(
      [..._mintIds]
        .sort((a, b) => a.localeCompare(b))
        .map((item) => new PublicKey(item))
    );
  }, [inputMints, setErrors, setInputMints, setMintIds]);

  return (
    <div className="flex flex-col">
      <textarea
        value={inputMints}
        onChange={(e) => setInputMints(e.currentTarget.value)}
      ></textarea>
      <button
        onClick={() => {
          processInput();
        }}
        className="bg-blue-500 text-white py-2 px-4 rounded"
      >
        Process
      </button>
      <div className="flex flex-col">
        {mintIds.map((item, idx) => (
          <div key={idx}>{item.toBase58()}</div>
        ))}
      </div>
      {errors.map((item, idx) => <div key={idx}>{item.i}: {item.e}</div>)}
    </div>
  );
};

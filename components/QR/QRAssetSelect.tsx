import { useRef } from 'react'

export interface QRAssetSelectOption {
    key: string
    value: string
    text: string
}

interface QRAssetSelectProps {
    options: QRAssetSelectOption[]
    onSelect: React.Dispatch<React.SetStateAction<number[]>>
}

export function QRAssetSelect(props: QRAssetSelectProps) {

	const selectedAssets = useRef<string[]>([]);
    
    const assetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		//selectedAssets.current = (Array.from(e.target.options).filter(o => o.selected).map(o => o.value));
        props.onSelect(Array.from(e.target.options).filter(o => o.selected).map(o => parseInt(o.value)))
		console.log(selectedAssets.current);
	};

    return (
        <select className="form-control" name="assetList" multiple={true} onChange={assetChange} style={{height:"300px"}}>
            {
                props.options.map((trio) => {
                    return <option key={trio.key} value={trio.value}>{trio.text}</option>
                })
            }
        </select>
    );
}
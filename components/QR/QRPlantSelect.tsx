interface QRPlantSelect {
    onSelect: React.ChangeEventHandler<HTMLSelectElement>
}

export default function QRPlantSelect(props: QRPlantSelect) {
    return (
        <select className="form-control" required onChange={props.onSelect}>
            <option value="" hidden>--Please Select a Plant--</option>
            <option value="2">Woodlands DHCS</option>
            <option value="3">Biopolis</option>
            <option value="4">Mediapolis</option>
            <option value="1">Changi DHCS</option>
        </select>
    );
}
import React, { useState } from 'react'
import Layout from '../components/Layout'
import ModuleSimplePopup from '../components/ModuleLayout/ModuleSimplePopup'

const Dashboard = () => {
	const [isModalOpen, setModalOpen] = useState(true);
	const [exampleText, setText] = useState("It uses the <ModuleSimplePopup> Component. Buttons can be added by adding <button> to the array in the buttons prop. Icons can be changed by changing the number in the icons prop. avdhasvhdvashdvashvdjhsavd")

	const changeText = () => {
		if(exampleText.charAt(0) === "I")
			return setText("yeah")
		return setText("It uses the <ModuleSimplePopup> Component. Buttons can be added by adding <button> to the array in the buttons prop. Icons can be changed by changing the number in the icons prop. avdhasvhdvashdvashvdjhsav")
	}

	return (
		<div>
			<ModuleSimplePopup
				modalOpenState={isModalOpen}
				setModalOpenState={setModalOpen}
				title={"This is a simple popup"}
				text={exampleText}
				icon={3}
				buttons={
					[
						<button className="btn btn-primary" onClick={() => alert("i have been clicked")}>Click</button>,
						<button className="btn btn-primary" onClick={() => changeText()}>change text</button>,
						<button className="btn btn-primary" onClick={() => setModalOpen(false)}>Cancel</button>
					]
				}
			/>
			
			Dashboard
			<button onClick={() => setModalOpen(true)}>open</button>
		</div>
		
	)
}

export default Dashboard
function Steps({ loginStep }) {
	const stepContainerStyles = `flex-1 ${
		loginStep === 1 && "border-b border-blue-500"
	} `;

	return (
		<div className="flex rounded-md text-center text-sm font-semibold text-gray-300 ">
			<div
				className={`flex-1 border-b py-4 ${
					loginStep === 1 && " border-b-2 border-blue-300 text-blue-300 "
				} `}
			>
				<h3>1. Kullanıcı Adı</h3>
			</div>
			<div
				className={`flex-1  border-b py-4 ${
					loginStep === 2 && "border-b-2 border-green-400 text-green-400"
				} `}
			>
				<h3>2. Doğrulama Kodu</h3>
			</div>
		</div>
	);
}

export default Steps;

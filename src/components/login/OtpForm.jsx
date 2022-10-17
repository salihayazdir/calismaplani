import Loader from "../Loader";

export default function OtpForm({
	otpFormData,
	handleOtpFormChange,
	handleOtpFormSubmit,
	isLoading,
}) {
	return (
		<form className="flex flex-col" onSubmit={handleOtpFormSubmit}>
			<div className="relative rounded-md ">
				<input
					id="otp"
					name="otp"
					type="text"
					required
					disabled={isLoading}
					pattern="^[0-9]{6}$"
					value={otpFormData.otp}
					onChange={handleOtpFormChange}
					className="peer block w-full appearance-none rounded-lg border border-gray-300 bg-transparent p-4 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-0"
					placeholder=" "
				/>
				<label
					htmlFor="otp"
					className="absolute top-1 left-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-gray-500 duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-1 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:px-2 peer-focus:text-green-500 "
				>
					Doğrulama Kodunuz
				</label>
			</div>
			<p className="mt-2 text-xs text-gray-400">
				Mail adresinize gönderilmiş olan 6 haneli doğrulama kodu.
			</p>
			{isLoading ? (
				<div className=" mt-8 flex w-full justify-center text-center ">
					<Loader />
				</div>
			) : (
				<button
					type="submit"
					className="group relative mt-8 flex w-full justify-center rounded-md border border-transparent bg-green-500 py-4 px-4 text-base font-medium text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
				>
					Giriş Yap
				</button>
			)}
		</form>
	);
}

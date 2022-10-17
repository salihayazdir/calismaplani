import Link from "next/link";

export default function yetkisizIslem() {
	return (
		<div>
			<h2>Bu sayfayı görüntüleme yetkiniz bulunmuyor.</h2>
			<Link href="/giris">
				<a>Giriş Yap</a>
			</Link>
		</div>
	);
}

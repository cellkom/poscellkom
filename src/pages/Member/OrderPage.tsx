import MemberLayout from "@/components/Layout/MemberLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";

const OrderPage = () => {
    const { orderId } = useParams();

    return (
        <MemberLayout>
            <div className="max-w-2xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>Pemesanan</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center space-y-4">
                        <p className="text-lg">Anda akan memesan: <span className="font-semibold">{orderId}</span></p>
                        <p className="text-muted-foreground">
                            Fitur pemesanan, keranjang, dan checkout sedang dalam tahap pengembangan.
                            Terima kasih atas kesabaran Anda!
                        </p>
                        <Button asChild>
                            <Link to="/member/home">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Kembali ke Home
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </MemberLayout>
    );
};

export default OrderPage;
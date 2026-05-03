import { Alert, AlertTitle } from "@/components/ui/alert";
import { ConstructionIcon } from "lucide-react";

export default function EnConstruccion() {
    return (
        <div className="flex flex-col items-center justify-center ">
            <Alert className="max-w-md text-center">
                <ConstructionIcon className="w-12 h-12 mx-auto text-yellow-500" />
                <AlertTitle className="mt-4 text-lg font-bold">Página en construcción</AlertTitle>
                <p className="text-gray-600">Esta página estará disponible pronto.</p>
            </Alert>
        </div>
    );
}

import { useState } from "react";
import { XCircle, AlertCircle, Search } from "lucide-react";

export default function OrderNotFound({ showOrderNotFound, setshowOrderNotFound, orderIdInput, setOrderIdInput, setOrderPhoneInput }) {

    return (
        <>
            {
                showOrderNotFound && (
                    <section className="max-w-6xl mx-auto px-4 md:px-8">
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
                            <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl p-6 text-center relative animate-fadeIn border border-red-100">
                                
                                {/* CLOSE BUTTON */}
                                <button
                                    onClick={() => {
                                        setshowOrderNotFound(false);
                                        setOrderIdInput('');
                                        setOrderPhoneInput('');
                                    }}
                                    className="absolute top-3 right-3 text-gray-400 hover:text-black transition-colors"
                                >
                                    <XCircle className="w-5 h-5" />
                                </button>

                                {/* ERROR VISUAL */}
                                <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <AlertCircle className="w-6 h-6" />
                                </div>

                                {/* HEADER */}
                                <h3 className="text-base md:text-lg font-bold text-gray-900 mb-1">
                                    Order Not Found
                                </h3>
                                
                                {/* SUBTEXT */}
                                <p className="text-xs md:text-sm text-gray-500 mb-6 px-2">
                                    We couldn't find any order matching <span className="font-semibold text-gray-800 break-all">"{orderIdInput}"</span>. Please check for spelling mistakes and try again.
                                </p>

                                {/* ACTION BUTTONS */}
                                <div className="flex flex-col gap-2">
                                    <button
                                        onClick={() => {
                                            setshowOrderNotFound(false);
                                            setOrderIdInput(""); 
                                            setOrderPhoneInput("");
                                        }}
                                        className="w-full bg-stone-900 hover:bg-stone-800 text-white py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all active:scale-95"
                                    >
                                        Try Again
                                    </button>
                                    {/* <button
                                        onClick={() => setshowOrderNotFound(false)}
                                        className="w-full bg-gray-50 hover:bg-gray-100 text-gray-600 py-2.5 rounded-xl font-semibold text-xs transition-all"
                                    >
                                        Cancel
                                    </button> */}
                                </div>
                            </div>
                        </div>
                    </section>
                )
            }
        </>
    );
}

"use client";

import { DashboardHeader } from "@/components/header";
import { DashboardShell } from "@/components/shell";
import { useEffect, useState } from "react";
import { axiosInstance } from "@/lib/axios";

import dropin, { Dropin } from "braintree-web-drop-in";

import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Icons } from "@/components/icons";

const metadata = {
  title: "Payments Page",
  description: "Page to test payments.",
};

export default function PaymentsPage() {
  const [clientToken, setClientToken] = useState<string | null>(null);
  const [dropinInstance, setDropinInstance] = useState<Dropin | null>(null);

  const [toAddress, setToAddress] = useState(
    "0xe5548bc565f9c3a05266a7fcb144b0ab0aef3f906b254a647d1854604a0bf69c"
  );
  const [aptAmount, setAptAmount] = useState(0.01);

  const [txHash, setTxHash] = useState<null | string>(null);

  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

  useEffect(() => {
    async function fetchClientToken() {
      const res = await axiosInstance.get("/paypal/client-token");
      const clientToken = res.data as string;

      setClientToken(clientToken);
    }

    fetchClientToken();
  }, []);

  useEffect(() => {
    async function initDropIn() {
      if (!clientToken) return;

      const dropinInstance = await dropin.create({
        authorization: clientToken,
        container: "#dropin-container-div",
        paypal: {
          flow: "checkout",
          currency: "INR",
        },
      });

      setDropinInstance(dropinInstance);
    }

    initDropIn();
  }, [clientToken]);

  async function handlePayment() {
    if (!dropinInstance) return;

    try {
      setIsPaymentProcessing(true);

      if (aptAmount <= 0 || aptAmount > 0.05) {
        toast({
          title: "Invalid amount",
          variant: "destructive",
          description:
            "For testing purposes, we have restricted the amount between 0.01-0.05",
        });

        return;
      }

      if (!toAddress) {
        toast({
          title: "Invalid address",
          variant: "destructive",
          description: "Please enter a valid address",
        });

        return;
      }

      const paymentPayload = await dropinInstance.requestPaymentMethod();

      const { nonce } = paymentPayload;

      const payload = {
        nonce,
        toAddress: toAddress,
        aptAmount: aptAmount,
      };

      const res = await axiosInstance.post("/paypal/checkout", payload);

      const data = res.data as {
        message: string;
        id: string;
        txHash: string;
        gatewayId: string;
      };

      setTxHash(data.txHash);

      toast({
        title: data.message,
        description: `Transaction Hash: ${data.txHash}`,
      });
    } catch (err) {
      console.log(err);
      toast({
        title: "An error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsPaymentProcessing(false);
    }
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Send APT"
        text="Page to send APT through Fiat/Paypal"
      />

      {!clientToken && <p>Loading...</p>}

      <div className="max-w-screen-sm">
        <div className="grid gap-2 mb-4">
          <Alert>
            <AlertDescription className="text-muted-foreground">
              For testing purposes, we have restricted the amount between
              0.01-0.05
            </AlertDescription>
          </Alert>

          <Alert>
            <AlertDescription className="text-muted-foreground">
              <span className="font-bold">Card Number: </span>4111 1111 1111
              1111
            </AlertDescription>

            <AlertDescription className="text-muted-foreground">
              <span className="font-bold">Date of Expiry: </span>11/26
            </AlertDescription>
          </Alert>

          <Separator className="my-4 w-9/12 mx-auto" />

          <div className="grid gap-1">
            <Label className="sr-only" htmlFor="email">
              To Address
            </Label>

            <Input
              id="toAddress"
              value={toAddress}
              placeholder="0x123..."
              type="text"
              autoCapitalize="none"
              autoComplete="off"
              autoCorrect="off"
              disabled={isPaymentProcessing}
              onChange={(e) => setToAddress(e.target.value)}
            />
          </div>
          <div className="grid gap-1">
            <Label className="sr-only" htmlFor="email">
              Amount In APT
            </Label>
            <Input
              id="aptAmount"
              value={aptAmount}
              placeholder="0.01"
              type="number"
              autoCapitalize="none"
              autoComplete="off"
              autoCorrect="off"
              disabled={isPaymentProcessing}
              onChange={(e) => setAptAmount(parseFloat(e.target.value))}
            />
          </div>
        </div>

        <div id="dropin-container-div"></div>

        <Button
          onClick={handlePayment}
          className="w-full mt-2"
          disabled={isPaymentProcessing}
        >
          {isPaymentProcessing && <Icons.spinner className="mr-2" />}
          Pay {aptAmount} APT
        </Button>

        {txHash && (
          <Card className="mt-4 p-4">
            <p>
              <span className="font-bold">Transaction Hash: </span>
              <Link
                href={`https://explorer.aptoslabs.com/txn/${txHash}?network=testnet`}
                target="_blank"
                className="underline"
              >
                {txHash}
              </Link>
            </p>
          </Card>
        )}
      </div>
    </DashboardShell>
  );
}

'use client';

import { useMemo, useState } from 'react';
import { createBuyerRfqAction } from '@/server/actions/rfq-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function BuyerRfqForm({
  products,
}: {
  products: Array<{ id: string; title: string; category: string }>;
}) {
  const [selected, setSelected] = useState<string[]>(products.slice(0, 1).map((item) => item.id));
  const [shipmentType, setShipmentType] = useState<'LCL' | 'FCL' | 'AIR' | 'OTHER'>('FCL');
  const [incoterm, setIncoterm] = useState<'FOB' | 'FCA'>('FOB');

  const showFcaWarning = useMemo(() => shipmentType === 'FCL' && incoterm === 'FOB', [shipmentType, incoterm]);

  function toggleProduct(id: string) {
    setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  return (
    <form action={createBuyerRfqAction} className="space-y-5">
      <div className="space-y-3">
        <p className="text-sm font-medium text-slate-700">Select products for one RFQ</p>
        <div className="grid gap-3 md:grid-cols-2">
          {products.map((product) => (
            <label key={product.id} className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4 text-sm text-slate-700">
              <input
                type="checkbox"
                name="productIds"
                value={product.id}
                checked={selected.includes(product.id)}
                onChange={() => toggleProduct(product.id)}
                className="mt-1 h-4 w-4"
              />
              <span>
                <span className="block font-medium text-slate-950">{product.title}</span>
                <span className="block text-slate-500">{product.category}</span>
              </span>
            </label>
          ))}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Destination country</label>
          <Input name="destinationCountry" defaultValue="IN" required />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Destination port</label>
          <Input name="destinationPort" defaultValue="Nhava Sheva" required />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Target shipment month</label>
          <Input name="targetShipmentMonth" type="month" required />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Shipment type</label>
          <select
            name="shipmentType"
            value={shipmentType}
            onChange={(event) => setShipmentType(event.target.value as 'LCL' | 'FCL' | 'AIR' | 'OTHER')}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900"
          >
            <option value="FCL">Containerized (FCL)</option>
            <option value="LCL">LCL</option>
            <option value="AIR">Air</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Incoterm</label>
          <select
            name="incoterm"
            value={incoterm}
            onChange={(event) => setIncoterm(event.target.value as 'FOB' | 'FCA')}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900"
          >
            <option value="FOB">FOB</option>
            <option value="FCA">FCA</option>
          </select>
        </div>
      </div>
      {showFcaWarning ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          FCA review recommended: containerized shipment is selected with FOB. Check whether inland handover and stuffing control make FCA more appropriate.
        </div>
      ) : null}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Notes</label>
        <textarea
          name="notes"
          rows={4}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900"
          placeholder="Application, target approval pack, commercial notes, destination handling requirements…"
        />
      </div>
      <Button type="submit">Submit RFQ</Button>
    </form>
  );
}

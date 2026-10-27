import { LotWorkbench } from '../components/lot-workbench';
import { MyLots } from '../components/my-lots';

export function OfficePage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-14 px-4 py-10">
      <h1 className="text-3xl md:text-4xl">Escritório da casa</h1>
      <LotWorkbench />
      <section aria-labelledby="my-lots-heading" className="flex flex-col gap-5">
        <h2 id="my-lots-heading" className="text-2xl">
          Seus lotes
        </h2>
        <MyLots />
      </section>
    </div>
  );
}

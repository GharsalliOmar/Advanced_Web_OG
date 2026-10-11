// ue4 demo 7: aus PersonCard (responsibilities) und LocationCard (contains)
// herausgezogen - dort stand zweimal dasselbe <ul>{...map(<li>)}</ul>.
// variabel ist nur der inhalt (items), fest bleiben markup und key-regel.
// liegt im feature-ordner, weil bisher nur people-locations sie benutzt
// (regel aus demo 6).
interface BulletListProps {
  items: string[];
}

export default function BulletList({ items }: BulletListProps) {
  return (
    <ul>
      {/* index als key ist hier ok: statische text-liste ohne id, wird nie
          umsortiert/gefiltert und hat keinen eigenen zustand (ue4 demo 4 F3) */}
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}

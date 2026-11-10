const illustrations = {
  notes: <>
    <path className="art-depth" d="M26 15h-5v35h33v-4"/>
    <rect className="art-shell" x="26" y="9" width="33" height="39" rx="5"/>
    <path className="art-line" d="M34 19h17m-17 8h17m-17 8h11"/>
    <path className="art-signal" d="M19 22v-6h6m36 21v6h-6M20 29h43"/>
    <circle className="art-dot" cx="63" cy="29" r="2"/>
  </>,
  analysis: <>
    <rect className="art-shell" x="22" y="13" width="30" height="33" rx="5"/>
    <rect className="art-shell" x="29" y="8" width="30" height="33" rx="5"/>
    <path className="art-line" d="M36 17h15m-15 7h12m-12 7h6"/>
    <circle className="art-shell" cx="56" cy="38" r="10"/>
    <path className="art-signal" d="m52 38 3 3 5-6"/>
  </>,
  alignment: <>
    <path className="art-line" d="M22 29h36M40 29v13"/>
    <circle className="art-shell" cx="22" cy="27" r="9"/>
    <circle className="art-shell" cx="58" cy="27" r="9"/>
    <circle className="art-shell" cx="40" cy="43" r="7"/>
    <path className="art-signal" d="m35 27 4 4 6-7"/>
  </>,
  map: <>
    <path className="art-line" d="M23 29h12m10 0h7m0 0V15h9M52 29v14h9"/>
    <circle className="art-shell" cx="20" cy="29" r="6"/>
    <rect className="art-shell" x="34" y="23" width="12" height="12" rx="3"/>
    <circle className="art-shell" cx="63" cy="15" r="5"/>
    <circle className="art-shell" cx="63" cy="43" r="5"/>
    <path className="art-signal" d="M20 29h1m18 0h2m21-14h2m-2 28h2"/>
  </>,
  prototype: <>
    <path className="art-depth" d="M22 9h43l4 5v30l-5 6H23l-6-5V14z"/>
    <rect className="art-shell" x="17" y="11" width="47" height="36" rx="6"/>
    <path className="art-line" d="M18 20h45m-22 8h13m-13 7h10"/>
    <rect className="art-signal" x="24" y="26" width="11" height="13" rx="2"/>
    <path className="art-signal" d="m54 36 2 13 3-5 5-2z"/>
  </>,
  inbox: <>
    <rect className="art-shell" x="29" y="9" width="23" height="23" rx="4"/>
    <path className="art-line" d="M35 16h11m-11 7h8"/>
    <path className="art-shell" d="M18 29h15l3 5h8l3-5h15v14a5 5 0 0 1-5 5H23a5 5 0 0 1-5-5z"/>
    <path className="art-signal" d="M36 40h8m-4-30v13m-4-4 4 4 4-4"/>
  </>,
  draft: <>
    <path className="art-depth" d="M26 13h34v38H26z"/>
    <rect className="art-shell" x="22" y="10" width="34" height="38" rx="5"/>
    <path className="art-line" d="M30 19h16m-16 8h13m-13 8h6"/>
    <path className="art-signal" d="m42 39 3-7 13-13 5 5-13 13z"/>
  </>,
  review: <>
    <rect className="art-shell" x="23" y="12" width="34" height="35" rx="6"/>
    <rect className="art-shell" x="32" y="8" width="16" height="9" rx="3"/>
    <path className="art-line" d="M31 24h17m-17 7h9m-9 7h9"/>
    <circle className="art-shell" cx="55" cy="39" r="10"/>
    <path className="art-signal" d="m51 39 3 3 5-6"/>
  </>,
  sources: <>
    <path className="art-depth" d="m15 16 22-7 12 35-22 7zM39 11l25 4-5 36-25-4z"/>
    <rect className="art-shell" x="26" y="10" width="30" height="37" rx="5"/>
    <path className="art-signal" d="M34 20h14m-14 7h14m-14 7h9"/>
    <circle className="art-dot" cx="59" cy="43" r="2"/>
  </>,
  compare: <>
    <rect className="art-shell" x="12" y="14" width="23" height="32" rx="4"/>
    <rect className="art-shell" x="45" y="14" width="23" height="32" rx="4"/>
    <path className="art-line" d="M18 23h10m-10 15h10m24-15h10m-10 15h10"/>
    <path className="art-signal" d="M21 30h38M35 34l5 5 5-5"/>
    <circle className="art-dot" cx="40" cy="30" r="2.8"/>
  </>,
  insight: <>
    <path className="art-depth" d="M25 13h36v35H25z"/>
    <rect className="art-shell" x="20" y="9" width="36" height="38" rx="5"/>
    <path className="art-line" d="M28 35h19m-19 6h13"/>
    <path className="art-signal" d="m28 29 7-7 5 4 8-10m-5 0h5v5M63 13v10m-5-5h10"/>
  </>,
  criteria: <>
    <path className="art-depth" d="M25 13h37v36H25z"/>
    <rect className="art-shell" x="20" y="9" width="36" height="37" rx="5"/>
    <path className="art-line" d="M37 20h12m-12 8h12m-12 8h12"/>
    <path className="art-signal" d="m26 19 2 2 4-4m-6 10 2 2 4-4m-6 10 2 2 4-4"/>
  </>,
  verify: <>
    <rect className="art-shell" x="18" y="10" width="31" height="39" rx="5"/>
    <path className="art-line" d="M25 20h16m-16 8h15m-15 8h10"/>
    <circle className="art-shell" cx="51" cy="31" r="12"/>
    <path className="art-signal" d="m59 40 8 8M46 31l3 3 6-7"/>
  </>,
};

export default function WorkflowIllustration({ kind }) {
  return <svg className="workflow-art" viewBox="0 0 80 58" width="80" height="58" aria-hidden="true">
    <path className="art-platform" d="m10 49 30-8 30 8-30 7z" />
    {illustrations[kind]}
  </svg>;
}

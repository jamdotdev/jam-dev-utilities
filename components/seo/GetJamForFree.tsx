export default function GetJamForFree() {
  return (
    <div className="border bg-muted rounded-xl px-6 py-12 items-center flex flex-col justify-center">
      <button
        className="flex overflow-hidden mb-4 rounded-[12px] shadow-xl shadow-leaf/20 ring-2 ring-black/10 transition duration-300 hover:shadow-leaf/40 active:shadow-lg active:shadow-leaf/30"
        onClick={() => {
          window.open(
            "https://chrome.google.com/webstore/detail/jam/iohjgamcilhbgmhbnllfolmkmmekfmci",
            "_blank"
          );
        }}
      >
        <span
          style={{ boxShadow: "0px 1px 1px 0px #C5FFE7 inset" }}
          className="text-black pointer-events-none flex min-h-[64px] items-center rounded-[12px] bg-gradient-to-b from-[#73E5BF] to-[#73E5A7] px-8 py-4 font-sfpro text-[22px] font-medium leading-[1]"
        >
          Get Jam for Free
        </span>
      </button>
      <ChromeRating />
    </div>
  );
}

function ChromeRating() {
  return (
    <div className="flex items-center justify-center gap-[10px] text-sm">
      <div className="flex items-center justify-center">
        <div className="mr-1 h-4">
          <div className="flex text-darkGrey">
            <Star />
            <Star />
            <Star />
            <Star />
            <Star />
          </div>
        </div>

        <span className="text-[14px] text-muted-foreground">
          150+ reviews <span className="font-bold">·</span> 100k+ users{" "}
        </span>
      </div>
    </div>
  );
}

function Star() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="star_24px">
        <path
          id="icon/toggle/star_24px"
          d="M12 17.5196L16.15 20.0296C16.91 20.4896 17.84 19.8096 17.64 18.9496L16.54 14.2296L20.21 11.0496C20.88 10.4696 20.5199 9.36958 19.6399 9.29958L14.81 8.88958L12.92 4.42958C12.58 3.61958 11.42 3.61958 11.08 4.42958L9.18995 8.87958L4.35995 9.28958C3.47995 9.35958 3.11995 10.4596 3.78995 11.0396L7.45995 14.2196L6.35995 18.9396C6.15995 19.7996 7.08995 20.4796 7.84995 20.0196L12 17.5196Z"
          fill="#73E5BF"
        />
      </g>
    </svg>
  );
}

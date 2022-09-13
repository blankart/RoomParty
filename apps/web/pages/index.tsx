import Button from "@web/components/Button/Button";

export default function Index() {
  return (
    <div>
      <Button
        onClick={() => {
          window.googleClient?.requestCode();
        }}
      >
        Sign in
      </Button>
    </div>
  );
}

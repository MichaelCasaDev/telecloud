import Link from "next/link";
import { GetServerSidePropsContext } from "next";
import { checkAuth } from "../../lib/checkAuth";
import * as Icon from "react-feather";
import Cloud from "../../components/Cloud";

export default function Page() {
  const routeNavigator = (
    <p>
      <Link href="/cloud">
        <a>
          <Icon.Home
            size={16}
            style={{
              marginBottom: "-2px",
            }}
          />{" "}
          <span>Home</span>
        </a>
      </Link>
      {" > "}
    </p>
  );

  return <Cloud routeNavigator={routeNavigator} />;
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const okAuth: boolean = await checkAuth(context);

  if (!okAuth) {
    return {
      redirect: {
        permanent: false,
        destination: "/login",
      },
    };
  } else {
    return { props: {} };
  }
}

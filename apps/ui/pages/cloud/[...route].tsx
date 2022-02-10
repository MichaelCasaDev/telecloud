import Link from "next/link";
import { GetServerSidePropsContext } from "next";
import { checkAuth } from "../../lib/checkAuth";
import * as Icon from "react-feather";
import Cloud from "../../components/Cloud";
import { useRouter } from "next/dist/client/router";

export default function Page() {
  const router = useRouter();
  const path = router.asPath.replace("/cloud", "").startsWith("/")
    ? router.asPath.replace("/cloud", "")
    : "/" + router.asPath.replace("/cloud", "");

  let tmpRoute = "/cloud";
  const routes = path.split("/");
  routes.shift();

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
          Home
        </a>
      </Link>
      {" > "}
      {routes.map((e: any, i: number) => {
        tmpRoute += "/" + e;
        return (
          <>
            <Link href={tmpRoute} key={i}>
              <a>
                <Icon.Folder
                  size={16}
                  style={{
                    marginBottom: "-2px",
                  }}
                />{" "}
                {decodeURI(e)}
              </a>
            </Link>{" "}
            {">"}{" "}
          </>
        );
      })}
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

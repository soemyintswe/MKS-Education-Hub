import { useCallback, useEffect, useState } from "react";
import { CmsBundle, loadCmsContent } from "@/lib/cmsContent";

type UseCmsContentResult = {
  content: CmsBundle | null;
  loading: boolean;
  refresh: () => Promise<void>;
};

export function useCmsContent(): UseCmsContentResult {
  const [content, setContent] = useState<CmsBundle | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const loaded = await loadCmsContent();
      setContent(loaded);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { content, loading, refresh };
}


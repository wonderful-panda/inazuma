use neon::prelude::*;

pub trait JsObjectExtension<'a> {
    fn string_or_throw<C: Context<'a>>(&self, cx: &mut C, key: &str) -> NeonResult<String>;
    fn string_or_none<C: Context<'a>>(&self, cx: &mut C, key: &str) -> NeonResult<Option<String>>;
    fn number_or_throw<C: Context<'a>>(&self, cx: &mut C, key: &str) -> NeonResult<f64>;
    fn number_or_none<C: Context<'a>>(&self, cx: &mut C, key: &str) -> NeonResult<Option<f64>>;
    fn boolean_or_throw<C: Context<'a>>(&self, cx: &mut C, key: &str) -> NeonResult<bool>;
    fn boolean_or_none<C: Context<'a>>(&self, cx: &mut C, key: &str) -> NeonResult<Option<bool>>;
    fn object_or_throw<C: Context<'a>>(
        &self,
        cx: &mut C,
        key: &str,
    ) -> NeonResult<Handle<JsObject>>;
    fn object_or_none<C: Context<'a>>(
        &self,
        cx: &mut C,
        key: &str,
    ) -> NeonResult<Option<Handle<'a, JsObject>>>;
}

impl<'a> JsObjectExtension<'a> for Handle<'a, JsObject> {
    fn string_or_throw<C: Context<'a>>(&self, cx: &mut C, key: &str) -> NeonResult<String> {
        let value = self
            .get(cx, key)?
            .downcast_or_throw::<JsString, _>(cx)?
            .value(cx);
        Ok(value)
    }
    fn string_or_none<C: Context<'a>>(&self, cx: &mut C, key: &str) -> NeonResult<Option<String>> {
        let value = self
            .get(cx, key)?
            .downcast::<JsString, _>(cx)
            .map_or(None, |v| Some(v.value(cx)));
        Ok(value)
    }
    fn number_or_throw<C: Context<'a>>(&self, cx: &mut C, key: &str) -> NeonResult<f64> {
        let value = self
            .get(cx, key)?
            .downcast_or_throw::<JsNumber, _>(cx)?
            .value(cx);
        Ok(value)
    }
    fn number_or_none<C: Context<'a>>(&self, cx: &mut C, key: &str) -> NeonResult<Option<f64>> {
        let value = self
            .get(cx, key)?
            .downcast::<JsNumber, _>(cx)
            .map_or(None, |v| Some(v.value(cx)));
        Ok(value)
    }
    fn boolean_or_throw<C: Context<'a>>(&self, cx: &mut C, key: &str) -> NeonResult<bool> {
        let value = self
            .get(cx, key)?
            .downcast_or_throw::<JsBoolean, _>(cx)?
            .value(cx);
        Ok(value)
    }
    fn boolean_or_none<C: Context<'a>>(&self, cx: &mut C, key: &str) -> NeonResult<Option<bool>> {
        let value = self
            .get(cx, key)?
            .downcast::<JsBoolean, _>(cx)
            .map_or(None, |v| Some(v.value(cx)));
        Ok(value)
    }
    fn object_or_throw<C: Context<'a>>(
        &self,
        cx: &mut C,
        key: &str,
    ) -> NeonResult<Handle<'a, JsObject>> {
        let value = self.get(cx, key)?.downcast_or_throw::<JsObject, _>(cx)?;
        Ok(value)
    }
    fn object_or_none<C: Context<'a>>(
        &self,
        cx: &mut C,
        key: &str,
    ) -> NeonResult<Option<Handle<'a, JsObject>>> {
        let value = self
            .get(cx, key)?
            .downcast::<JsObject, _>(cx)
            .map_or(None, |v| Some(v));
        Ok(value)
    }
}
